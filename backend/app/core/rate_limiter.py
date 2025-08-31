"""
Rate Limiter Service.
Implements rate limiting for API endpoints with Redis backend.
"""

import json
import time
import logging
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
import redis.asyncio as redis
import asyncio

from app.core.config import settings


logger = logging.getLogger(__name__)


class RateLimiter:
    """Rate limiter with Redis backend supporting multiple rate limiting strategies."""
    
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)
        
        # Default rate limits (can be overridden by deployment config)
        self.default_limits = {
            'requests_per_minute': settings.DEFAULT_REQUESTS_PER_MINUTE or 60,
            'requests_per_hour': settings.DEFAULT_REQUESTS_PER_HOUR or 1000,
            'requests_per_day': settings.DEFAULT_REQUESTS_PER_DAY or 10000,
            'batch_requests_per_minute': settings.DEFAULT_BATCH_REQUESTS_PER_MINUTE or 10,
            'batch_instances_per_minute': settings.DEFAULT_BATCH_INSTANCES_PER_MINUTE or 1000,
        }
        
        # Rate limit windows in seconds
        self.windows = {
            'minute': 60,
            'hour': 3600,
            'day': 86400
        }
    
    async def check_rate_limit(
        self, 
        client_id: str, 
        deployment_id: Optional[str] = None,
        endpoint: str = "inference"
    ) -> bool:
        """
        Check if client is within rate limits for regular inference requests.
        
        Args:
            client_id: Client identifier (API key or IP)
            deployment_id: Optional deployment-specific limits
            endpoint: API endpoint name
            
        Returns:
            True if request is allowed, False if rate limited
        """
        try:
            # Get rate limits for this client/deployment
            limits = await self._get_rate_limits(client_id, deployment_id, endpoint)
            
            # Check all time windows
            for window_name, limit in limits.items():
                if limit <= 0:  # No limit set
                    continue
                
                window_seconds = self.windows.get(window_name.split('_')[-1], 60)
                key = f"rate_limit:{endpoint}:{client_id}:{window_name}"
                
                # Use sliding window counter
                allowed = await self._sliding_window_check(key, limit, window_seconds)
                if not allowed:
                    logger.warning(f"Rate limit exceeded for {client_id} on {endpoint} ({window_name}: {limit})")
                    
                    # Store rate limit violation
                    await self._log_rate_limit_violation(
                        client_id, deployment_id, endpoint, window_name, limit
                    )
                    return False
            
            # All checks passed - increment counters
            for window_name in limits.keys():
                if limits[window_name] > 0:
                    window_seconds = self.windows.get(window_name.split('_')[-1], 60)
                    key = f"rate_limit:{endpoint}:{client_id}:{window_name}"
                    await self._increment_counter(key, window_seconds)
            
            return True
            
        except Exception as e:
            logger.error(f"Rate limiting check failed: {str(e)}")
            # Fail open - allow request if rate limiter is broken
            return True
    
    async def check_batch_rate_limit(
        self, 
        client_id: str, 
        instance_count: int,
        deployment_id: Optional[str] = None
    ) -> bool:
        """
        Check batch inference rate limits.
        
        Args:
            client_id: Client identifier
            instance_count: Number of instances in batch
            deployment_id: Optional deployment-specific limits
            
        Returns:
            True if batch is allowed, False if rate limited
        """
        try:
            # Get batch-specific limits
            limits = await self._get_batch_rate_limits(client_id, deployment_id)
            
            # Check batch request frequency
            batch_req_key = f"rate_limit:batch_requests:{client_id}:minute"
            batch_allowed = await self._sliding_window_check(
                batch_req_key, 
                limits['batch_requests_per_minute'], 
                60
            )
            
            if not batch_allowed:
                logger.warning(f"Batch request rate limit exceeded for {client_id}")
                return False
            
            # Check total instances per minute
            instance_key = f"rate_limit:batch_instances:{client_id}:minute"
            current_instances = await self._get_counter_value(instance_key, 60)
            
            if current_instances + instance_count > limits['batch_instances_per_minute']:
                logger.warning(f"Batch instance rate limit exceeded for {client_id}")
                return False
            
            # Also check regular rate limits
            regular_allowed = await self.check_rate_limit(client_id, deployment_id, "batch_inference")
            if not regular_allowed:
                return False
            
            # All checks passed - increment counters
            await self._increment_counter(batch_req_key, 60)
            await self._increment_counter(instance_key, 60, instance_count)
            
            return True
            
        except Exception as e:
            logger.error(f"Batch rate limiting check failed: {str(e)}")
            return True
    
    async def _get_rate_limits(
        self, 
        client_id: str, 
        deployment_id: Optional[str],
        endpoint: str
    ) -> Dict[str, int]:
        """Get rate limits for client, considering custom limits and tiers."""
        
        # Start with defaults
        limits = {
            'requests_per_minute': self.default_limits['requests_per_minute'],
            'requests_per_hour': self.default_limits['requests_per_hour'],
            'requests_per_day': self.default_limits['requests_per_day']
        }
        
        # Check for custom client limits (stored in Redis or database)
        custom_limits = await self._get_custom_limits(client_id, deployment_id)
        if custom_limits:
            limits.update(custom_limits)
        
        # Apply tier-based limits if client has API key
        if client_id != "anonymous":
            tier_limits = await self._get_tier_limits(client_id)
            if tier_limits:
                limits.update(tier_limits)
        
        return limits
    
    async def _get_batch_rate_limits(
        self, 
        client_id: str, 
        deployment_id: Optional[str]
    ) -> Dict[str, int]:
        """Get batch-specific rate limits."""
        
        limits = {
            'batch_requests_per_minute': self.default_limits['batch_requests_per_minute'],
            'batch_instances_per_minute': self.default_limits['batch_instances_per_minute']
        }
        
        # Check for custom batch limits
        custom_limits = await self._get_custom_limits(client_id, deployment_id, limit_type="batch")
        if custom_limits:
            limits.update(custom_limits)
        
        return limits
    
    async def _get_custom_limits(
        self, 
        client_id: str, 
        deployment_id: Optional[str],
        limit_type: str = "regular"
    ) -> Optional[Dict[str, int]]:
        """Fetch custom rate limits from Redis cache."""
        try:
            # Try client-specific limits first
            key = f"custom_limits:{limit_type}:{client_id}"
            if deployment_id:
                key += f":{deployment_id}"
            
            limits_json = await self.redis_client.get(key)
            if limits_json:
                return json.loads(limits_json)
            
            # Try deployment-wide limits
            if deployment_id:
                deploy_key = f"custom_limits:{limit_type}:deployment:{deployment_id}"
                limits_json = await self.redis_client.get(deploy_key)
                if limits_json:
                    return json.loads(limits_json)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get custom limits: {str(e)}")
            return None
    
    async def _get_tier_limits(self, client_id: str) -> Optional[Dict[str, int]]:
        """Get tier-based limits for API key."""
        try:
            # Get API key tier from cache
            tier_key = f"api_key_tier:{client_id}"
            tier = await self.redis_client.get(tier_key)
            
            if not tier:
                # Fallback to database lookup (simplified)
                return None
            
            tier = tier.decode('utf-8')
            
            # Define tier-based limits
            tier_limits = {
                'free': {
                    'requests_per_minute': 10,
                    'requests_per_hour': 100,
                    'requests_per_day': 1000
                },
                'basic': {
                    'requests_per_minute': 60,
                    'requests_per_hour': 1000,
                    'requests_per_day': 10000
                },
                'pro': {
                    'requests_per_minute': 300,
                    'requests_per_hour': 5000,
                    'requests_per_day': 50000
                },
                'enterprise': {
                    'requests_per_minute': 1000,
                    'requests_per_hour': 20000,
                    'requests_per_day': 200000
                }
            }
            
            return tier_limits.get(tier, {})
            
        except Exception as e:
            logger.error(f"Failed to get tier limits: {str(e)}")
            return None
    
    async def _sliding_window_check(
        self, 
        key: str, 
        limit: int, 
        window_seconds: int
    ) -> bool:
        """
        Implement sliding window rate limiting using Redis sorted sets.
        
        Args:
            key: Redis key for this rate limit
            limit: Maximum requests allowed in window
            window_seconds: Window size in seconds
            
        Returns:
            True if request is allowed, False if rate limited
        """
        try:
            current_time = time.time()
            window_start = current_time - window_seconds
            
            # Remove expired entries
            await self.redis_client.zremrangebyscore(key, 0, window_start)
            
            # Count current requests in window
            current_count = await self.redis_client.zcard(key)
            
            if current_count >= limit:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Sliding window check failed: {str(e)}")
            return True
    
    async def _increment_counter(
        self, 
        key: str, 
        window_seconds: int, 
        increment: int = 1
    ):
        """Increment rate limit counter."""
        try:
            current_time = time.time()
            
            # Add current request to sorted set
            await self.redis_client.zadd(key, {str(current_time): current_time})
            
            # Set expiration to window + buffer
            await self.redis_client.expire(key, window_seconds + 60)
            
        except Exception as e:
            logger.error(f"Failed to increment counter: {str(e)}")
    
    async def _get_counter_value(self, key: str, window_seconds: int) -> int:
        """Get current counter value for window."""
        try:
            current_time = time.time()
            window_start = current_time - window_seconds
            
            # Remove expired entries
            await self.redis_client.zremrangebyscore(key, 0, window_start)
            
            # Count current entries
            return await self.redis_client.zcard(key)
            
        except Exception as e:
            logger.error(f"Failed to get counter value: {str(e)}")
            return 0
    
    async def _log_rate_limit_violation(
        self, 
        client_id: str,
        deployment_id: Optional[str],
        endpoint: str,
        window_name: str,
        limit: int
    ):
        """Log rate limit violations for monitoring."""
        try:
            violation_data = {
                'client_id': client_id,
                'deployment_id': deployment_id,
                'endpoint': endpoint,
                'window': window_name,
                'limit': limit,
                'timestamp': datetime.utcnow().isoformat(),
                'violation_type': 'rate_limit_exceeded'
            }
            
            # Store in Redis list for monitoring
            await self.redis_client.lpush(
                f"rate_limit_violations:{client_id}",
                json.dumps(violation_data)
            )
            
            # Keep only last 100 violations per client
            await self.redis_client.ltrim(f"rate_limit_violations:{client_id}", 0, 99)
            
        except Exception as e:
            logger.error(f"Failed to log rate limit violation: {str(e)}")
    
    async def get_rate_limit_status(
        self, 
        client_id: str,
        deployment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get current rate limit status for client.
        
        Args:
            client_id: Client identifier
            deployment_id: Optional deployment ID
            
        Returns:
            Dictionary with current usage and limits
        """
        try:
            limits = await self._get_rate_limits(client_id, deployment_id, "inference")
            status = {}
            
            for window_name, limit in limits.items():
                if limit <= 0:
                    continue
                
                window_seconds = self.windows.get(window_name.split('_')[-1], 60)
                key = f"rate_limit:inference:{client_id}:{window_name}"
                
                current_count = await self._get_counter_value(key, window_seconds)
                remaining = max(0, limit - current_count)
                
                status[window_name] = {
                    'limit': limit,
                    'used': current_count,
                    'remaining': remaining,
                    'reset_time': datetime.utcnow() + timedelta(seconds=window_seconds)
                }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get rate limit status: {str(e)}")
            return {}
    
    async def set_custom_limits(
        self,
        client_id: str,
        limits: Dict[str, int],
        deployment_id: Optional[str] = None,
        ttl_hours: int = 24
    ):
        """
        Set custom rate limits for a client.
        
        Args:
            client_id: Client identifier
            limits: Dictionary of limit overrides
            deployment_id: Optional deployment-specific limits
            ttl_hours: How long to keep custom limits
        """
        try:
            key = f"custom_limits:regular:{client_id}"
            if deployment_id:
                key += f":{deployment_id}"
            
            await self.redis_client.setex(
                key,
                ttl_hours * 3600,
                json.dumps(limits)
            )
            
            logger.info(f"Set custom limits for {client_id}: {limits}")
            
        except Exception as e:
            logger.error(f"Failed to set custom limits: {str(e)}")
    
    async def remove_custom_limits(
        self,
        client_id: str,
        deployment_id: Optional[str] = None
    ):
        """Remove custom rate limits for a client."""
        try:
            key = f"custom_limits:regular:{client_id}"
            if deployment_id:
                key += f":{deployment_id}"
            
            await self.redis_client.delete(key)
            
            logger.info(f"Removed custom limits for {client_id}")
            
        except Exception as e:
            logger.error(f"Failed to remove custom limits: {str(e)}")
    
    async def get_violations_summary(
        self, 
        client_id: Optional[str] = None,
        hours: int = 24
    ) -> Dict[str, Any]:
        """
        Get rate limit violations summary.
        
        Args:
            client_id: Optional specific client
            hours: Time window for summary
            
        Returns:
            Dictionary with violation statistics
        """
        try:
            if client_id:
                # Get violations for specific client
                violations_key = f"rate_limit_violations:{client_id}"
                violations = await self.redis_client.lrange(violations_key, 0, -1)
                
                violations_data = []
                cutoff_time = datetime.utcnow() - timedelta(hours=hours)
                
                for violation_json in violations:
                    try:
                        violation = json.loads(violation_json)
                        violation_time = datetime.fromisoformat(violation['timestamp'])
                        if violation_time > cutoff_time:
                            violations_data.append(violation)
                    except:
                        continue
                
                return {
                    'client_id': client_id,
                    'violations_count': len(violations_data),
                    'violations': violations_data,
                    'period_hours': hours
                }
            else:
                # Get aggregate statistics (would need more complex implementation)
                return {'message': 'Aggregate statistics not implemented'}
                
        except Exception as e:
            logger.error(f"Failed to get violations summary: {str(e)}")
            return {'error': str(e)}
    
    async def reset_client_limits(self, client_id: str):
        """Reset all rate limit counters for a client."""
        try:
            # Find all rate limit keys for this client
            pattern = f"rate_limit:*:{client_id}:*"
            keys = await self.redis_client.keys(pattern)
            
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Reset rate limits for client {client_id}")
                
        except Exception as e:
            logger.error(f"Failed to reset client limits: {str(e)}")
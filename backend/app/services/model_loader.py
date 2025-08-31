"""
Model Loader Service.
Handles loading, caching, and management of ML models in memory.
"""

import os
import pickle
import joblib
import logging
import asyncio
import psutil
from typing import Dict, Any, Optional, Union
from datetime import datetime, timedelta
from pathlib import Path
import hashlib
import json

from app.core.config import settings
from app.models.model_version import ModelVersion
from app.core.exceptions import ModelError


logger = logging.getLogger(__name__)


class ModelLoader:
    """Service for loading and managing ML models in memory."""
    
    def __init__(self):
        self.loaded_models: Dict[str, Any] = {}
        self.model_metadata: Dict[str, Dict[str, Any]] = {}
        self.load_times: Dict[str, datetime] = {}
        self.access_times: Dict[str, datetime] = {}
        self.model_locks: Dict[str, asyncio.Lock] = {}
        self.max_models_in_memory = settings.MAX_MODELS_IN_MEMORY or 10
        self.model_ttl_hours = settings.MODEL_TTL_HOURS or 24
        
        # Start cleanup task
        asyncio.create_task(self._cleanup_task())
    
    async def get_model(self, model_version_id: str) -> Any:
        """
        Get a loaded model by version ID. Load if not already in memory.
        
        Args:
            model_version_id: Model version ID
            
        Returns:
            Loaded model object
            
        Raises:
            ModelError: If model loading fails
        """
        # Update access time
        self.access_times[model_version_id] = datetime.utcnow()
        
        # Return if already loaded
        if model_version_id in self.loaded_models:
            logger.info(f"Model {model_version_id} served from memory cache")
            return self.loaded_models[model_version_id]
        
        # Get or create lock for this model
        if model_version_id not in self.model_locks:
            self.model_locks[model_version_id] = asyncio.Lock()
        
        # Load model with lock to prevent concurrent loading
        async with self.model_locks[model_version_id]:
            # Check again in case another coroutine loaded it
            if model_version_id in self.loaded_models:
                return self.loaded_models[model_version_id]
            
            # Load the model
            model = await self._load_model_from_storage(model_version_id)
            
            # Check memory limits before adding
            await self._ensure_memory_capacity()
            
            # Store in memory
            self.loaded_models[model_version_id] = model
            self.load_times[model_version_id] = datetime.utcnow()
            self.access_times[model_version_id] = datetime.utcnow()
            
            logger.info(f"Model {model_version_id} loaded into memory")
            return model
    
    async def _load_model_from_storage(self, model_version_id: str) -> Any:
        """Load model from file storage."""
        try:
            # Get model version info from database
            from app.core.deps import get_db
            from sqlalchemy.orm import Session
            from sqlalchemy import select
            
            # This would normally use dependency injection, but for simplicity:
            db = next(get_db())
            query = select(ModelVersion).where(ModelVersion.id == model_version_id)
            result = db.execute(query)
            model_version = result.scalar_one_or_none()
            
            if not model_version:
                raise ModelError(f"Model version {model_version_id} not found")
            
            if not model_version.model_path:
                raise ModelError(f"Model path not specified for version {model_version_id}")
            
            model_path = Path(model_version.model_path)
            
            if not model_path.exists():
                raise ModelError(f"Model file not found: {model_path}")
            
            # Load based on framework and file extension
            framework = model_version.framework.lower()
            model = await self._load_by_framework(model_path, framework)
            
            # Store metadata
            self.model_metadata[model_version_id] = {
                'framework': framework,
                'model_path': str(model_path),
                'file_size': model_path.stat().st_size,
                'model_hash': await self._calculate_file_hash(model_path),
                'load_time': datetime.utcnow(),
                'model_version': model_version
            }
            
            logger.info(f"Successfully loaded {framework} model from {model_path}")
            return model
            
        except Exception as e:
            logger.error(f"Failed to load model {model_version_id}: {str(e)}")
            raise ModelError(f"Model loading failed: {str(e)}")
    
    async def _load_by_framework(self, model_path: Path, framework: str) -> Any:
        """Load model based on its framework."""
        try:
            if framework in ['sklearn', 'scikit-learn']:
                return await self._load_sklearn_model(model_path)
            elif framework == 'xgboost':
                return await self._load_xgboost_model(model_path)
            elif framework == 'lightgbm':
                return await self._load_lightgbm_model(model_path)
            elif framework == 'catboost':
                return await self._load_catboost_model(model_path)
            elif framework == 'pytorch':
                return await self._load_pytorch_model(model_path)
            elif framework == 'tensorflow':
                return await self._load_tensorflow_model(model_path)
            elif framework == 'onnx':
                return await self._load_onnx_model(model_path)
            elif framework == 'mlflow':
                return await self._load_mlflow_model(model_path)
            else:
                # Try generic pickle/joblib loading
                return await self._load_pickle_model(model_path)
                
        except Exception as e:
            raise ModelError(f"Failed to load {framework} model: {str(e)}")
    
    async def _load_sklearn_model(self, model_path: Path) -> Any:
        """Load scikit-learn model."""
        if model_path.suffix == '.pkl':
            with open(model_path, 'rb') as f:
                return pickle.load(f)
        elif model_path.suffix == '.joblib':
            return joblib.load(model_path)
        else:
            raise ModelError(f"Unsupported sklearn model format: {model_path.suffix}")
    
    async def _load_xgboost_model(self, model_path: Path) -> Any:
        """Load XGBoost model."""
        import xgboost as xgb
        
        if model_path.suffix == '.json':
            model = xgb.XGBClassifier()
            model.load_model(str(model_path))
            return model
        elif model_path.suffix == '.pkl':
            return pickle.load(open(model_path, 'rb'))
        else:
            # Try native XGBoost format
            model = xgb.Booster()
            model.load_model(str(model_path))
            return model
    
    async def _load_lightgbm_model(self, model_path: Path) -> Any:
        """Load LightGBM model."""
        import lightgbm as lgb
        return lgb.Booster(model_file=str(model_path))
    
    async def _load_catboost_model(self, model_path: Path) -> Any:
        """Load CatBoost model."""
        from catboost import CatBoostClassifier, CatBoostRegressor
        
        # Try to determine if it's classifier or regressor from metadata
        # For now, try CatBoostClassifier first
        try:
            model = CatBoostClassifier()
            model.load_model(str(model_path))
            return model
        except:
            model = CatBoostRegressor()
            model.load_model(str(model_path))
            return model
    
    async def _load_pytorch_model(self, model_path: Path) -> Any:
        """Load PyTorch model."""
        import torch
        
        # Load model state dict or full model
        if model_path.suffix == '.pth' or model_path.suffix == '.pt':
            return torch.load(model_path, map_location='cpu')
        else:
            raise ModelError(f"Unsupported PyTorch model format: {model_path.suffix}")
    
    async def _load_tensorflow_model(self, model_path: Path) -> Any:
        """Load TensorFlow/Keras model."""
        import tensorflow as tf
        
        if model_path.is_dir():
            # SavedModel format
            return tf.saved_model.load(str(model_path))
        elif model_path.suffix == '.h5':
            # HDF5 format
            return tf.keras.models.load_model(str(model_path))
        else:
            raise ModelError(f"Unsupported TensorFlow model format: {model_path.suffix}")
    
    async def _load_onnx_model(self, model_path: Path) -> Any:
        """Load ONNX model."""
        import onnxruntime as ort
        
        # Create inference session
        session_options = ort.SessionOptions()
        session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        
        return ort.InferenceSession(
            str(model_path), 
            session_options,
            providers=['CPUExecutionProvider']  # Add GPU providers if available
        )
    
    async def _load_mlflow_model(self, model_path: Path) -> Any:
        """Load MLflow model."""
        import mlflow.pyfunc
        return mlflow.pyfunc.load_model(str(model_path))
    
    async def _load_pickle_model(self, model_path: Path) -> Any:
        """Load generic pickle/joblib model."""
        if model_path.suffix == '.pkl':
            with open(model_path, 'rb') as f:
                return pickle.load(f)
        elif model_path.suffix == '.joblib':
            return joblib.load(model_path)
        else:
            raise ModelError(f"Unsupported model format: {model_path.suffix}")
    
    async def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of model file."""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    async def _ensure_memory_capacity(self):
        """Ensure we don't exceed memory limits."""
        current_count = len(self.loaded_models)
        
        if current_count >= self.max_models_in_memory:
            # Unload least recently used models
            models_by_access = sorted(
                self.access_times.items(), 
                key=lambda x: x[1]
            )
            
            models_to_unload = models_by_access[:current_count - self.max_models_in_memory + 1]
            
            for model_id, _ in models_to_unload:
                await self.unload_model(model_id)
    
    async def unload_model(self, model_version_id: str) -> bool:
        """
        Unload model from memory.
        
        Args:
            model_version_id: Model version ID to unload
            
        Returns:
            True if model was unloaded, False if not found
        """
        if model_version_id not in self.loaded_models:
            return False
        
        # Remove from memory
        del self.loaded_models[model_version_id]
        del self.load_times[model_version_id]
        del self.access_times[model_version_id]
        
        if model_version_id in self.model_metadata:
            del self.model_metadata[model_version_id]
        
        if model_version_id in self.model_locks:
            del self.model_locks[model_version_id]
        
        logger.info(f"Model {model_version_id} unloaded from memory")
        return True
    
    async def is_model_loaded(self, model_version_id: str) -> bool:
        """Check if model is loaded in memory."""
        return model_version_id in self.loaded_models
    
    async def check_model_health(self, model_version_id: str) -> bool:
        """
        Check if loaded model is healthy (can make predictions).
        """
        if model_version_id not in self.loaded_models:
            return False
        
        try:
            model = self.loaded_models[model_version_id]
            framework = self.model_metadata.get(model_version_id, {}).get('framework', '')
            
            # Simple health check - try to access model attributes
            if framework in ['sklearn', 'xgboost', 'lightgbm', 'catboost']:
                return hasattr(model, 'predict')
            elif framework == 'pytorch':
                import torch
                return isinstance(model, torch.nn.Module) or callable(model)
            elif framework == 'tensorflow':
                return hasattr(model, '__call__') or hasattr(model, 'predict')
            elif framework == 'onnx':
                return hasattr(model, 'run')
            else:
                return hasattr(model, 'predict') or callable(model)
                
        except Exception as e:
            logger.warning(f"Model health check failed for {model_version_id}: {str(e)}")
            return False
    
    async def get_memory_usage(self, model_version_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get memory usage statistics.
        
        Args:
            model_version_id: Optional specific model ID
            
        Returns:
            Memory usage information
        """
        process = psutil.Process()
        memory_info = process.memory_info()
        
        result = {
            'total_memory_mb': memory_info.rss / 1024 / 1024,
            'loaded_models_count': len(self.loaded_models),
            'available_slots': self.max_models_in_memory - len(self.loaded_models)
        }
        
        if model_version_id and model_version_id in self.model_metadata:
            metadata = self.model_metadata[model_version_id]
            result['model_file_size_mb'] = metadata['file_size'] / 1024 / 1024
            result['load_time'] = metadata['load_time'].isoformat()
            result['last_access'] = self.access_times.get(model_version_id, datetime.utcnow()).isoformat()
        
        return result
    
    async def get_loaded_models_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all loaded models."""
        info = {}
        
        for model_id in self.loaded_models.keys():
            info[model_id] = {
                'load_time': self.load_times.get(model_id, datetime.utcnow()).isoformat(),
                'last_access': self.access_times.get(model_id, datetime.utcnow()).isoformat(),
                'metadata': self.model_metadata.get(model_id, {}),
                'healthy': await self.check_model_health(model_id)
            }
        
        return info
    
    async def _cleanup_task(self):
        """Background task to cleanup old models."""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                current_time = datetime.utcnow()
                ttl_threshold = current_time - timedelta(hours=self.model_ttl_hours)
                
                # Find models that haven't been accessed recently
                models_to_cleanup = [
                    model_id for model_id, last_access in self.access_times.items()
                    if last_access < ttl_threshold
                ]
                
                # Unload old models
                for model_id in models_to_cleanup:
                    await self.unload_model(model_id)
                    logger.info(f"Cleaned up unused model: {model_id}")
                
            except Exception as e:
                logger.error(f"Model cleanup task failed: {str(e)}")
    
    async def reload_model(self, model_version_id: str) -> Any:
        """
        Force reload a model from storage.
        
        Args:
            model_version_id: Model version ID to reload
            
        Returns:
            Reloaded model object
        """
        # Unload if already loaded
        if model_version_id in self.loaded_models:
            await self.unload_model(model_version_id)
        
        # Load fresh copy
        return await self.get_model(model_version_id)
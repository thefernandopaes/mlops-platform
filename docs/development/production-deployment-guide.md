# MLOps Platform - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the MLOps Platform to production. The platform is designed for cloud-native deployment with high availability, scalability, and security.

**Reference Agent**: [DevOps/Infrastructure Specialist](../../agentes/devops-infrastructure.md)

## Prerequisites

### Infrastructure Requirements
- **Kubernetes Cluster**: v1.24+ (EKS, GKE, or AKS recommended)
- **Container Registry**: Docker Hub, ECR, GCR, or ACR
- **Database**: PostgreSQL 14+ (managed service recommended)
- **Cache**: Redis 6+ (managed service recommended)
- **Storage**: S3-compatible object storage
- **DNS**: Custom domain with SSL certificate
- **Monitoring**: Prometheus + Grafana (optional but recommended)

### Tools Required
- `kubectl` v1.24+
- `docker` v20.10+
- `helm` v3.8+
- `terraform` v1.3+ (if using IaC)
- `git` v2.30+

### Accounts & Access
- Cloud provider account (AWS/GCP/Azure)
- Domain registrar access
- Email service (SendGrid/SES) for notifications
- Slack workspace (optional, for alerts)

## Phase 1: Infrastructure Setup

### 1.1 Cloud Infrastructure Provisioning

#### Option A: AWS Deployment (Recommended)

```bash
# 1. Create infrastructure using Terraform
terraform init
terraform plan -var-file="production.tfvars"
terraform apply

# 2. Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name mlops-platform-cluster
```

**Terraform Configuration** (`infrastructure/aws/main.tf`):
```hcl
# EKS Cluster
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = "mlops-platform"
  cluster_version = "1.28"
  
  node_groups = {
    main = {
      instance_types = ["m5.xlarge"]
      min_size      = 2
      max_size      = 10
      desired_size  = 3
    }
    gpu = {
      instance_types = ["g4dn.xlarge"]
      min_size      = 0
      max_size      = 5
      desired_size  = 1
      ami_type      = "AL2_x86_64_GPU"
    }
  }
}

# RDS PostgreSQL
module "rds" {
  source = "terraform-aws-modules/rds/aws"
  
  identifier = "mlops-platform-db"
  engine     = "postgres"
  engine_version = "14.9"
  instance_class = "db.r5.xlarge"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az = true
  publicly_accessible = false
}

# ElastiCache Redis
module "redis" {
  source = "terraform-aws-modules/elasticache/aws"
  
  cluster_id         = "mlops-platform-cache"
  engine             = "redis"
  node_type          = "cache.r5.large"
  num_cache_nodes    = 1
  parameter_group    = "default.redis7"
  port               = 6379
  
  subnet_group_name = module.vpc.elasticache_subnet_group_name
  security_group_ids = [module.security_group.security_group_id]
}

# S3 Bucket for model storage
resource "aws_s3_bucket" "mlops_models" {
  bucket = "mlops-platform-models-${random_id.suffix.hex}"
}
```

#### Option B: GCP Deployment

```bash
# 1. Create GKE cluster
gcloud container clusters create mlops-platform \
  --zone=us-central1-a \
  --machine-type=n1-standard-4 \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10

# 2. Configure kubectl
gcloud container clusters get-credentials mlops-platform --zone=us-central1-a
```

### 1.2 Kubernetes Cluster Setup

```bash
# 1. Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# 2. Install cert-manager for SSL
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# 3. Install monitoring stack (optional)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### 1.3 DNS and SSL Configuration

```yaml
# cert-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Phase 2: Application Deployment

### 2.1 Container Images Build & Push

```bash
# 1. Build backend image
cd backend
docker build -t yourdomain.com/mlops-platform/backend:v1.0.0 .
docker push yourdomain.com/mlops-platform/backend:v1.0.0

# 2. Build frontend image  
cd ../frontend
docker build -t yourdomain.com/mlops-platform/frontend:v1.0.0 .
docker push yourdomain.com/mlops-platform/frontend:v1.0.0
```

### 2.2 Kubernetes Secrets Management

```bash
# 1. Create namespace
kubectl create namespace mlops-platform

# 2. Create database secrets
kubectl create secret generic postgres-credentials \
  --namespace=mlops-platform \
  --from-literal=username=mlops_user \
  --from-literal=password=your-secure-password \
  --from-literal=database=mlops_platform \
  --from-literal=host=your-rds-endpoint.amazonaws.com

# 3. Create Redis secrets
kubectl create secret generic redis-credentials \
  --namespace=mlops-platform \
  --from-literal=url=redis://your-redis-cluster.cache.amazonaws.com:6379

# 4. Create application secrets
kubectl create secret generic app-secrets \
  --namespace=mlops-platform \
  --from-literal=secret-key=your-secret-key \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=minio-access-key=your-minio-key \
  --from-literal=minio-secret-key=your-minio-secret

# 5. Create email service secrets (if using)
kubectl create secret generic email-credentials \
  --namespace=mlops-platform \
  --from-literal=sendgrid-api-key=your-sendgrid-key \
  --from-literal=smtp-username=your-smtp-user \
  --from-literal=smtp-password=your-smtp-password
```

### 2.3 Helm Chart Deployment

Create Helm chart structure:

```bash
# Create Helm chart
helm create mlops-platform-chart
cd mlops-platform-chart
```

**values.yaml** (Production Configuration):
```yaml
# Global settings
global:
  imageRegistry: yourdomain.com/mlops-platform
  imageTag: v1.0.0
  environment: production

# Backend configuration
backend:
  replicaCount: 3
  image:
    repository: backend
    tag: v1.0.0
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80

  env:
    DATABASE_URL: "postgresql://$(POSTGRES_USERNAME):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST)/$(POSTGRES_DATABASE)"
    REDIS_URL: "$(REDIS_URL)"
    SECRET_KEY: "$(SECRET_KEY)"
    JWT_SECRET: "$(JWT_SECRET)"
    ENVIRONMENT: "production"
    LOG_LEVEL: "INFO"
    ALLOWED_HOSTS: "api.yourdomain.com,yourdomain.com"

# Frontend configuration
frontend:
  replicaCount: 2
  image:
    repository: frontend
    tag: v1.0.0
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

# Database (if deploying in-cluster)
postgresql:
  enabled: false  # Use managed service
  
# Redis (if deploying in-cluster)  
redis:
  enabled: false  # Use managed service

# Ingress configuration
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
  hosts:
    - host: yourdomain.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
    - host: api.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
          service: backend
  tls:
    - secretName: mlops-platform-tls
      hosts:
        - yourdomain.com
        - api.yourdomain.com

# Monitoring
monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: your-grafana-password

# Backup configuration
backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention: "30d"
```

**Deploy with Helm**:
```bash
# 1. Install/upgrade the application
helm upgrade --install mlops-platform ./mlops-platform-chart \
  --namespace mlops-platform \
  --values values.yaml \
  --wait --timeout=10m

# 2. Verify deployment
kubectl get pods -n mlops-platform
kubectl get services -n mlops-platform
kubectl get ingress -n mlops-platform
```

## Phase 3: Database Migration & Setup

### 3.1 Database Migration

```bash
# 1. Run database migrations
kubectl exec -n mlops-platform deployment/backend -- \
  python -m alembic upgrade head

# 2. Create initial admin user (optional)
kubectl exec -n mlops-platform deployment/backend -- \
  python scripts/create_admin_user.py \
  --email admin@yourdomain.com \
  --password admin-password \
  --organization "Your Organization"
```

### 3.2 Initial Data Setup

```bash
# 1. Load sample data (optional)
kubectl exec -n mlops-platform deployment/backend -- \
  python scripts/load_sample_data.py

# 2. Configure organization settings
# Use the web interface at https://yourdomain.com/admin
```

## Phase 4: Security Configuration

### 4.1 SSL/TLS Setup

The platform automatically configures SSL using cert-manager and Let's Encrypt. Verify certificates:

```bash
# Check certificate status
kubectl describe certificate mlops-platform-tls -n mlops-platform

# Check ingress
kubectl get ingress -n mlops-platform
```

### 4.2 Network Security

**Security Group Rules** (AWS example):
```bash
# Backend API (private)
- Port 8000: From ALB only
- Port 5432: From backend only (PostgreSQL)
- Port 6379: From backend only (Redis)

# Frontend (public via ALB)
- Port 80: From anywhere (redirects to 443)
- Port 443: From anywhere (HTTPS)

# Management
- Port 22: From bastion host only
- Port 9090: From monitoring subnet (Prometheus)
- Port 3000: From monitoring subnet (Grafana)
```

### 4.3 Secrets Management

Consider using cloud-native secret management:

```bash
# AWS Secrets Manager integration
kubectl create secret generic aws-secrets \
  --from-literal=region=us-west-2 \
  --from-literal=secret-arn=arn:aws:secretsmanager:us-west-2:123456789:secret:mlops-platform

# External Secrets Operator (recommended)
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace
```

## Phase 5: Monitoring & Observability Setup

### 5.1 Application Monitoring

**Prometheus Configuration**:
```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'mlops-backend'
      static_configs:
      - targets: ['backend-service:8000']
      metrics_path: '/metrics'
      
    - job_name: 'mlops-inference'
      static_configs:
      - targets: ['backend-service:8000']
      metrics_path: '/api/v1/metrics'
      
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

**Grafana Dashboards**:
- Import dashboard ID `1860` for Kubernetes monitoring
- Create custom MLOps dashboard for:
  - API request rates and latencies
  - Model inference metrics
  - Error rates by endpoint
  - Database performance
  - Cache hit rates

### 5.2 Log Aggregation

```bash
# Install ELK stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace \
  --set replicas=3

helm install kibana elastic/kibana \
  --namespace logging
  
helm install filebeat elastic/filebeat \
  --namespace logging
```

### 5.3 Alerting Rules

**AlertManager Configuration**:
```yaml
# alerts.yaml
groups:
- name: mlops-platform
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    annotations:
      summary: High error rate detected
      
  - alert: ModelInferenceLatency
    expr: histogram_quantile(0.95, rate(inference_duration_seconds_bucket[5m])) > 1
    for: 5m
    annotations:
      summary: Model inference latency is high
      
  - alert: DatabaseConnections
    expr: pg_stat_database_numbackends > 80
    for: 2m
    annotations:
      summary: High number of database connections
```

## Phase 6: Performance Optimization

### 6.1 Database Optimization

```sql
-- Production database optimizations
-- Run these on your PostgreSQL instance

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_experiments_project_id ON experiments(project_id);
CREATE INDEX CONCURRENTLY idx_models_organization_id ON models(organization_id);
CREATE INDEX CONCURRENTLY idx_deployments_status ON deployments(status);
CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Configure connection pooling
-- Add to postgresql.conf:
max_connections = 200
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 64MB
maintenance_work_mem = 512MB
```

### 6.2 Redis Optimization

```bash
# Redis production configuration
# Add to redis.conf:
maxmemory 4gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 6.3 CDN Setup

```bash
# CloudFront distribution (AWS)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json

# Configure cache headers in frontend
# Add to nginx.conf:
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Phase 7: Backup & Disaster Recovery

### 7.1 Database Backup

```bash
# Automated backup with Velero
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts/
helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set-file credentials.secretContents.cloud=./credentials-velero

# Create backup schedule
cat <<EOF | kubectl apply -f -
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
    - mlops-platform
    storageLocation: default
    ttl: 720h0m0s
EOF
```

### 7.2 Model Storage Backup

```bash
# S3 cross-region replication
aws s3api put-bucket-replication \
  --bucket mlops-platform-models \
  --replication-configuration file://replication-config.json
```

## Phase 8: Testing & Validation

### 8.1 Health Checks

```bash
# 1. Backend health check
curl -f https://api.yourdomain.com/health

# 2. Frontend availability
curl -f https://yourdomain.com/

# 3. Database connectivity
kubectl exec -n mlops-platform deployment/backend -- \
  python -c "from app.core.database import engine; print('DB OK' if engine.connect() else 'DB FAIL')"

# 4. Redis connectivity
kubectl exec -n mlops-platform deployment/backend -- \
  python -c "import redis; r=redis.from_url('$REDIS_URL'); print('Redis OK' if r.ping() else 'Redis FAIL')"
```

### 8.2 Load Testing

```bash
# Install k6 for load testing
# Test inference endpoint
k6 run --vus 50 --duration 5m load-tests/inference-test.js

# Test authentication
k6 run --vus 20 --duration 2m load-tests/auth-test.js
```

**Load Test Script** (`load-tests/inference-test.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const payload = JSON.stringify({
    instances: [
      { feature1: 1.0, feature2: 2.0, feature3: 3.0 }
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-api-key'
    },
  };

  const response = http.post(
    'https://api.yourdomain.com/api/v1/inference/test-model',
    payload,
    params
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 8.3 End-to-End Testing

```bash
# Run automated E2E tests
cd frontend
npm run test:e2e:production

# Manual testing checklist
# ✅ User registration and login
# ✅ Project creation and management
# ✅ Model upload and registration
# ✅ Experiment tracking
# ✅ Model deployment
# ✅ Inference API calls
# ✅ Monitoring dashboards
# ✅ API key management
# ✅ Onboarding tour
```

## Phase 9: Production Configuration

### 9.1 Environment Variables

**Backend Production Environment**:
```env
# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=your-production-secret-key
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE_MINUTES=60

# Database
DATABASE_URL=postgresql://user:pass@host:5432/mlops_platform
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Cache
REDIS_URL=redis://redis-cluster:6379
REDIS_EXPIRE=3600

# Storage
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=mlops-platform-models

# Rate Limiting
DEFAULT_REQUESTS_PER_MINUTE=100
DEFAULT_REQUESTS_PER_HOUR=5000
DEFAULT_BATCH_REQUESTS_PER_MINUTE=20
MAX_MODELS_IN_MEMORY=50
MODEL_TTL_HOURS=48

# Monitoring
PROMETHEUS_METRICS=true
SENTRY_DSN=your-sentry-dsn

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
```

**Frontend Production Environment**:
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Application
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_DSN=your-frontend-sentry-dsn

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ONBOARDING=true
NEXT_PUBLIC_ENABLE_HELP_CHAT=true
```

### 9.2 Resource Limits & Scaling

**Production Pod Specifications**:
```yaml
# Backend pods
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 4Gi

# Frontend pods
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Phase 10: Go-Live Checklist

### 10.1 Pre-Launch Validation

- [ ] **Infrastructure**: All services healthy and auto-scaling configured
- [ ] **Database**: Migrations applied, indexes created, connection pooling configured
- [ ] **SSL/TLS**: Valid certificates installed and auto-renewal configured
- [ ] **DNS**: Domain pointing to load balancer, CDN configured
- [ ] **Monitoring**: Prometheus, Grafana, and alerts configured
- [ ] **Backup**: Automated backups tested and working
- [ ] **Security**: Secrets rotated, least privilege access implemented
- [ ] **Performance**: Load testing passed, response times under thresholds
- [ ] **Documentation**: Deployment runbooks and troubleshooting guides ready

### 10.2 Production Smoke Tests

```bash
# Test script for production validation
#!/bin/bash

echo "🚀 Running production smoke tests..."

# 1. Health checks
echo "Checking backend health..."
curl -f https://api.yourdomain.com/health || exit 1

echo "Checking frontend availability..."
curl -f https://yourdomain.com/ || exit 1

# 2. API functionality
echo "Testing authentication..."
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' || exit 1

# 3. Database connectivity  
echo "Testing database..."
kubectl exec -n mlops-platform deployment/backend -- \
  python -c "from app.core.database import engine; engine.connect()" || exit 1

# 4. Model inference (if models are deployed)
echo "Testing inference API..."
curl -X POST https://api.yourdomain.com/api/v1/inference/test-model \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"instances":[{"feature1":1.0}]}' || exit 1

echo "✅ All smoke tests passed!"
```

### 10.3 Monitoring Dashboard Setup

Access Grafana at `https://grafana.yourdomain.com` and import these dashboards:

1. **MLOps Platform Overview**:
   - API request rates and response times
   - Database performance metrics
   - Cache hit rates
   - Active users and sessions

2. **Model Performance**:
   - Inference request volume
   - Model latency percentiles
   - Error rates by model
   - Resource utilization

3. **Infrastructure Health**:
   - Kubernetes cluster metrics
   - Pod CPU and memory usage
   - Storage usage and growth
   - Network traffic patterns

## Phase 11: Operational Procedures

### 11.1 Deployment Updates

```bash
# Rolling update procedure
# 1. Update image tags in values.yaml
# 2. Run helm upgrade
helm upgrade mlops-platform ./mlops-platform-chart \
  --namespace mlops-platform \
  --values values.yaml \
  --wait --timeout=10m

# 3. Verify deployment
kubectl rollout status deployment/backend -n mlops-platform
kubectl rollout status deployment/frontend -n mlops-platform

# 4. Run smoke tests
./scripts/production-smoke-tests.sh
```

### 11.2 Backup Procedures

```bash
# Manual database backup
kubectl exec -n mlops-platform deployment/backend -- \
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
kubectl exec -i -n mlops-platform deployment/backend -- \
  psql $DATABASE_URL < backup-20250831.sql
```

### 11.3 Scaling Procedures

```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n mlops-platform
kubectl scale deployment frontend --replicas=3 -n mlops-platform

# Check HPA status
kubectl get hpa -n mlops-platform
```

## Troubleshooting Guide

### Common Issues

#### 1. Pod CrashLoopBackOff
```bash
# Check pod logs
kubectl logs -f deployment/backend -n mlops-platform

# Check resource limits
kubectl describe pod <pod-name> -n mlops-platform

# Common fixes:
# - Increase memory limits
# - Check database connectivity
# - Verify environment variables
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
kubectl exec -n mlops-platform deployment/backend -- \
  python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')"

# Check connection pool
kubectl logs deployment/backend -n mlops-platform | grep "connection pool"
```

#### 3. High Memory Usage
```bash
# Check memory usage
kubectl top pods -n mlops-platform

# Enable memory profiling
kubectl set env deployment/backend MEMORY_PROFILING=true -n mlops-platform
```

#### 4. SSL Certificate Issues
```bash
# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check certificate status
kubectl describe certificate mlops-platform-tls -n mlops-platform

# Force certificate renewal
kubectl delete certificate mlops-platform-tls -n mlops-platform
```

## Security Hardening

### Production Security Checklist

- [ ] **Network Security**: Private subnets for databases, security groups configured
- [ ] **Access Control**: RBAC configured, service accounts with minimal permissions
- [ ] **Secrets Management**: All secrets in Kubernetes secrets or external vault
- [ ] **Container Security**: Images scanned for vulnerabilities, non-root users
- [ ] **API Security**: Rate limiting enabled, input validation, CORS configured
- [ ] **Audit Logging**: All user actions logged and monitored
- [ ] **Data Encryption**: TLS in transit, encryption at rest for databases
- [ ] **Vulnerability Scanning**: Automated scanning in CI/CD pipeline

### Security Monitoring

```bash
# Install Falco for runtime security
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco \
  --namespace falco-system \
  --create-namespace
```

## Performance Benchmarks

### Expected Performance Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| API Response Time (p95) | < 200ms | < 500ms |
| Model Inference (p95) | < 1s | < 2s |
| Page Load Time | < 2s | < 4s |
| Database Query Time (p95) | < 100ms | < 300ms |
| Uptime | > 99.9% | > 99.5% |

### Load Testing Results

Run continuous load testing to ensure the platform can handle expected traffic:

```bash
# Continuous load test
k6 run --vus 100 --duration 30m load-tests/production-load.js
```

## Cost Optimization

### Resource Recommendations

**Minimum Production Setup**:
- Kubernetes: 3 nodes (4 vCPU, 16GB RAM each)
- Database: db.r5.large (2 vCPU, 16GB RAM)
- Redis: cache.r5.large (2 vCPU, 13GB RAM)
- Storage: 500GB (grows with models and data)

**Estimated Monthly Cost** (AWS):
- EKS Cluster: ~$300-500
- RDS PostgreSQL: ~$200-300  
- ElastiCache Redis: ~$150-200
- Load Balancer + Data Transfer: ~$50-100
- **Total: ~$700-1100/month**

### Cost Optimization Tips

1. Use Spot Instances for non-critical workloads
2. Configure cluster autoscaling
3. Set up resource quotas and limits
4. Use Reserved Instances for predictable workloads
5. Monitor and right-size resources regularly

## Support and Maintenance

### 11.1 Team Responsibilities

Reference the specialized agents for ongoing maintenance:

- **[Backend Issues](../../agentes/backend-python-fastapi.md)**: API bugs, performance issues
- **[Frontend Issues](../../agentes/frontend-react-typescript.md)**: UI bugs, user experience
- **[Database Issues](../../agentes/database-sqlalchemy.md)**: Query optimization, migrations
- **[Infrastructure Issues](../../agentes/devops-infrastructure.md)**: Deployments, scaling, monitoring
- **[Security Issues](../../agentes/security-authentication.md)**: Auth bugs, security updates
- **[ML Issues](../../agentes/ml-data-science.md)**: Model serving, inference problems

### 11.2 Maintenance Schedule

- **Daily**: Monitor dashboards, check alerts
- **Weekly**: Review resource utilization, update dependencies
- **Monthly**: Security patches, performance review
- **Quarterly**: Cost optimization review, capacity planning

## Next Steps

1. **🚀 Deploy to Staging**: Test the complete deployment process
2. **🔍 Security Audit**: Conduct thorough security review
3. **📊 Load Testing**: Validate performance under expected load
4. **👥 Team Training**: Train team on operational procedures
5. **📋 Documentation**: Update runbooks based on deployment experience

---

**Deployment Status**: Ready for Production  
**Last Updated**: 2025-08-31  
**Version**: v1.0.0

For questions or issues, reference the appropriate specialist agent or contact the DevOps team.
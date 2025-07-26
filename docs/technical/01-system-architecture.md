graph TB
    %% External Users
    Users[👥 Users<br/>ML Engineers, Data Scientists<br/>Managers, CTOs]
    
    %% Frontend Layer
    subgraph "Frontend Layer"
        WebApp[🌐 Web Application<br/>React + TypeScript<br/>Next.js]
        MobileApp[📱 Mobile App<br/>React Native<br/><i>Future</i>]
    end
    
    %% API Gateway & Load Balancer
    LB[⚡ Load Balancer<br/>NGINX + SSL Termination]
    Gateway[🚪 API Gateway<br/>FastAPI Router<br/>Rate Limiting + Auth]
    
    %% Core Backend Services
    subgraph "Core Backend Services"
        AuthService[🔐 Authentication Service<br/>FastAPI + JWT<br/>OAuth2 + SSO]
        UserService[👤 User Management Service<br/>FastAPI + SQLAlchemy<br/>RBAC + Tenancy]
        ModelService[🤖 Model Registry Service<br/>FastAPI + MLflow<br/>Versioning + Metadata]
        ExperimentService[🧪 Experiment Tracking<br/>FastAPI + MLflow<br/>Metrics + Artifacts]
        DeployService[🚀 Deployment Service<br/>FastAPI + Docker<br/>CI/CD Pipeline]
        MonitorService[📊 Monitoring Service<br/>FastAPI + Prometheus<br/>Alerts + Analytics]
        NotificationService[📧 Notification Service<br/>FastAPI + Celery<br/>Email + Slack + Teams]
    end
    
    %% Processing Layer
    subgraph "Background Processing"
        TaskQueue[📋 Task Queue<br/>Celery + Redis<br/>Async Jobs]
        ModelTraining[🏋️ Model Training<br/>Kubernetes Jobs<br/>GPU Support]
        DataPipeline[🔄 Data Pipeline<br/>Apache Airflow<br/>ETL + Scheduling]
    end
    
    %% Data Layer
    subgraph "Data Layer"
        MainDB[(🗄️ Main Database<br/>PostgreSQL<br/>Users + Models + Metrics)]
        CacheDB[(⚡ Cache Database<br/>Redis<br/>Sessions + Temp Data)]
        ObjectStore[(📦 Object Storage<br/>MinIO/S3<br/>Models + Datasets + Artifacts)]
        MetricsDB[(📈 Metrics Database<br/>InfluxDB<br/>Time Series Data)]
        SearchDB[(🔍 Search Database<br/>Elasticsearch<br/>Model Discovery)]
    end
    
    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        K8s[☸️ Kubernetes Cluster<br/>Container Orchestration<br/>Auto-scaling + Service Mesh]
        Monitoring[📊 Infrastructure Monitoring<br/>Prometheus + Grafana<br/>Metrics + Alerting]
        Logging[📝 Centralized Logging<br/>ELK Stack<br/>Logs + Debugging]
        Backup[💾 Backup System<br/>Automated Backups<br/>Disaster Recovery]
    end
    
    %% External Services
    subgraph "External Integrations"
        CloudAPIs[☁️ Cloud Provider APIs<br/>AWS + GCP + Azure<br/>Compute + Storage]
        MLAPIs[🤖 ML Service APIs<br/>OpenAI + HuggingFace<br/>LLMs + Transformers]
        CommAPIs[📢 Communication APIs<br/>Slack + Teams + Email<br/>Notifications + Webhooks]
        AuthProviders[🔑 Auth Providers<br/>Google + Microsoft + Okta<br/>SSO + Identity]
    end
    
    %% Model Serving Infrastructure
    subgraph "Model Serving"
        ModelServing[🎯 Model Serving<br/>FastAPI + Docker<br/>REST APIs + Scaling]
        LoadBalancer[⚖️ Model Load Balancer<br/>NGINX<br/>Request Routing]
        ModelCache[⚡ Model Cache<br/>Redis<br/>Prediction Caching]
    end
    
    %% Connections
    Users --> LB
    LB --> WebApp
    LB --> MobileApp
    
    WebApp --> Gateway
    MobileApp --> Gateway
    Gateway --> AuthService
    Gateway --> UserService
    Gateway --> ModelService
    Gateway --> ExperimentService
    Gateway --> DeployService
    Gateway --> MonitorService
    
    AuthService --> MainDB
    AuthService --> CacheDB
    UserService --> MainDB
    ModelService --> MainDB
    ModelService --> ObjectStore
    ExperimentService --> MainDB
    ExperimentService --> ObjectStore
    DeployService --> MainDB
    DeployService --> K8s
    MonitorService --> MetricsDB
    MonitorService --> MainDB
    
    DeployService --> TaskQueue
    ExperimentService --> TaskQueue
    MonitorService --> TaskQueue
    TaskQueue --> ModelTraining
    TaskQueue --> DataPipeline
    TaskQueue --> NotificationService
    
    ModelTraining --> ObjectStore
    ModelTraining --> MainDB
    DataPipeline --> MainDB
    DataPipeline --> ObjectStore
    
    NotificationService --> CommAPIs
    AuthService --> AuthProviders
    DeployService --> CloudAPIs
    ModelService --> MLAPIs
    ExperimentService --> MLAPIs
    
    K8s --> ModelServing
    LoadBalancer --> ModelServing
    ModelServing --> ModelCache
    ModelServing --> ObjectStore
    
    MonitorService --> Monitoring
    K8s --> Monitoring
    K8s --> Logging
    MainDB --> Backup
    ObjectStore --> Backup
    
    ModelService --> SearchDB
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef data fill:#fff3e0
    classDef infra fill:#e8f5e8
    classDef external fill:#fce4ec
    classDef serving fill:#f1f8e9
    
    class WebApp,MobileApp frontend
    class AuthService,UserService,ModelService,ExperimentService,DeployService,MonitorService,NotificationService backend
    class MainDB,CacheDB,ObjectStore,MetricsDB,SearchDB data
    class K8s,Monitoring,Logging,Backup infra
    class CloudAPIs,MLAPIs,CommAPIs,AuthProviders external
    class ModelServing,LoadBalancer,ModelCache serving
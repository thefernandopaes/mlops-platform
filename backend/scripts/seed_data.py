"""
Sample seed data for development environment
This script creates initial data for testing and development purposes.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import (
    Organization, User, OrganizationMembership, Project, ProjectMember,
    Model, ModelVersion, Experiment, ExperimentRun, RunMetric,
    Deployment, ApiKey, NotificationChannel
)
import hashlib
import secrets

def create_sample_data():
    """Create sample data for development"""
    db = SessionLocal()
    
    try:
        # Create sample organization
        org = Organization(
            id=uuid.uuid4(),
            name="Acme ML Corp",
            slug="acme-ml",
            description="A sample organization for MLOps platform development",
            billing_email="billing@acme-ml.com",
            subscription_plan="pro",
            subscription_status="active",
            is_active=True,
            max_users=50,
            max_projects=20,
            max_models=100,
            settings={"theme": "dark", "notifications": True}
        )
        db.add(org)
        db.flush()
        
        # Create sample users
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@acme-ml.com",
            password_hash=hashlib.sha256("admin123".encode()).hexdigest(),
            first_name="Admin",
            last_name="User",
            is_active=True,
            is_superuser=True,
            is_verified=True,
            settings={"timezone": "UTC", "language": "en"}
        )
        
        data_scientist = User(
            id=uuid.uuid4(),
            email="scientist@acme-ml.com",
            password_hash=hashlib.sha256("scientist123".encode()).hexdigest(),
            first_name="Data",
            last_name="Scientist",
            is_active=True,
            is_superuser=False,
            is_verified=True,
            settings={"timezone": "UTC", "language": "en"}
        )
        
        ml_engineer = User(
            id=uuid.uuid4(),
            email="engineer@acme-ml.com",
            password_hash=hashlib.sha256("engineer123".encode()).hexdigest(),
            first_name="ML",
            last_name="Engineer",
            is_active=True,
            is_superuser=False,
            is_verified=True,
            settings={"timezone": "UTC", "language": "en"}
        )
        
        db.add_all([admin_user, data_scientist, ml_engineer])
        db.flush()
        
        # Create organization memberships
        memberships = [
            OrganizationMembership(
                organization_id=org.id,
                user_id=admin_user.id,
                role="admin"
            ),
            OrganizationMembership(
                organization_id=org.id,
                user_id=data_scientist.id,
                role="member"
            ),
            OrganizationMembership(
                organization_id=org.id,
                user_id=ml_engineer.id,
                role="member"
            )
        ]
        db.add_all(memberships)
        db.flush()
        
        # Create sample projects
        fraud_detection_project = Project(
            id=uuid.uuid4(),
            organization_id=org.id,
            name="Fraud Detection",
            slug="fraud-detection",
            description="Machine learning models for detecting fraudulent transactions",
            visibility="private",
            is_active=True,
            created_by=admin_user.id,
            settings={"auto_deploy": False, "require_approval": True}
        )
        
        recommendation_project = Project(
            id=uuid.uuid4(),
            organization_id=org.id,
            name="Product Recommendations",
            slug="product-recommendations",
            description="Recommendation system for e-commerce platform",
            visibility="private",
            is_active=True,
            created_by=admin_user.id,
            settings={"auto_deploy": True, "require_approval": False}
        )
        
        db.add_all([fraud_detection_project, recommendation_project])
        db.flush()
        
        # Create project memberships
        project_members = [
            ProjectMember(
                project_id=fraud_detection_project.id,
                user_id=data_scientist.id,
                role="owner",
                added_by=admin_user.id
            ),
            ProjectMember(
                project_id=fraud_detection_project.id,
                user_id=ml_engineer.id,
                role="contributor",
                added_by=admin_user.id
            ),
            ProjectMember(
                project_id=recommendation_project.id,
                user_id=data_scientist.id,
                role="contributor",
                added_by=admin_user.id
            ),
            ProjectMember(
                project_id=recommendation_project.id,
                user_id=ml_engineer.id,
                role="owner",
                added_by=admin_user.id
            )
        ]
        db.add_all(project_members)
        db.flush()
        
        # Create sample models
        fraud_model = Model(
            id=uuid.uuid4(),
            organization_id=org.id,
            project_id=fraud_detection_project.id,
            name="XGBoost Fraud Classifier",
            description="XGBoost model for binary fraud classification",
            model_type="classification",
            task_type="binary_classification",
            framework="xgboost",
            tags=["fraud", "classification", "xgboost"],
            metadata={"features": 25, "training_samples": 100000},
            created_by=data_scientist.id
        )
        
        recommendation_model = Model(
            id=uuid.uuid4(),
            organization_id=org.id,
            project_id=recommendation_project.id,
            name="Collaborative Filtering",
            description="Matrix factorization model for product recommendations",
            model_type="recommendation",
            task_type="collaborative_filtering",
            framework="tensorflow",
            tags=["recommendation", "collaborative_filtering", "tensorflow"],
            metadata={"embedding_dim": 128, "users": 50000, "items": 10000},
            created_by=ml_engineer.id
        )
        
        db.add_all([fraud_model, recommendation_model])
        db.flush()
        
        # Create model versions
        fraud_v1 = ModelVersion(
            id=uuid.uuid4(),
            model_id=fraud_model.id,
            version="1.0.0",
            stage="production",
            model_file_path="/models/fraud_detection/v1.0.0/model.pkl",
            model_size_bytes=1024*1024*5,  # 5MB
            requirements="xgboost==1.7.0\nscikit-learn==1.2.0\npandas==1.5.0",
            performance_metrics={"accuracy": 0.95, "precision": 0.92, "recall": 0.89, "f1": 0.90},
            training_metrics={"train_accuracy": 0.97, "val_accuracy": 0.95, "train_loss": 0.15},
            model_schema={"input_features": ["amount", "merchant_id", "user_age"], "output": "fraud_probability"},
            description="Initial production version with high accuracy",
            created_by=data_scientist.id
        )
        
        recommendation_v1 = ModelVersion(
            id=uuid.uuid4(),
            model_id=recommendation_model.id,
            version="1.0.0",
            stage="staging",
            model_file_path="/models/recommendations/v1.0.0/model.h5",
            model_size_bytes=1024*1024*15,  # 15MB
            requirements="tensorflow==2.12.0\nnumpy==1.24.0\nscipy==1.10.0",
            performance_metrics={"ndcg@10": 0.85, "precision@10": 0.78, "recall@10": 0.82},
            training_metrics={"train_loss": 0.25, "val_loss": 0.28, "epochs": 50},
            model_schema={"input": "user_id", "output": "item_recommendations"},
            description="Initial version ready for staging deployment",
            created_by=ml_engineer.id
        )
        
        db.add_all([fraud_v1, recommendation_v1])
        db.flush()
        
        # Create sample experiment
        experiment = Experiment(
            id=uuid.uuid4(),
            organization_id=org.id,
            project_id=fraud_detection_project.id,
            model_id=fraud_model.id,
            name="Hyperparameter Tuning",
            description="Grid search for optimal XGBoost parameters",
            status="completed",
            config={"max_depth": [3, 5, 7], "learning_rate": [0.1, 0.01, 0.001]},
            created_by=data_scientist.id,
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc)
        )
        db.add(experiment)
        db.flush()
        
        # Create sample experiment run
        run = ExperimentRun(
            id=uuid.uuid4(),
            experiment_id=experiment.id,
            run_name="run_001",
            status="completed",
            parameters={"max_depth": 5, "learning_rate": 0.1, "n_estimators": 100},
            metrics={"accuracy": 0.95, "f1": 0.90},
            artifacts={"model_path": "/artifacts/run_001/model.pkl"},
            duration_seconds=3600,
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc)
        )
        db.add(run)
        db.flush()
        
        # Create sample deployment
        deployment = Deployment(
            id=uuid.uuid4(),
            organization_id=org.id,
            project_id=fraud_detection_project.id,
            model_version_id=fraud_v1.id,
            name="fraud-detection-prod",
            environment="production",
            endpoint_url="https://api.acme-ml.com/fraud-detection/predict",
            status="active",
            instance_type="medium",
            min_instances=2,
            max_instances=10,
            auto_scaling=True,
            deployment_config={"cpu_limit": "2", "memory_limit": "4Gi"},
            health_check_path="/health",
            created_by=ml_engineer.id,
            deployed_at=datetime.now(timezone.utc)
        )
        db.add(deployment)
        db.flush()
        
        # Create sample API key
        api_key = ApiKey(
            id=uuid.uuid4(),
            organization_id=org.id,
            user_id=data_scientist.id,
            name="Development API Key",
            key_hash=hashlib.sha256(f"sk-{secrets.token_urlsafe(32)}".encode()).hexdigest(),
            key_prefix="sk-dev",
            permissions={"models": ["read", "write"], "deployments": ["read"]},
            is_active=True
        )
        db.add(api_key)
        db.flush()
        
        # Create sample notification channel
        notification_channel = NotificationChannel(
            id=uuid.uuid4(),
            organization_id=org.id,
            name="Slack Alerts",
            channel_type="slack",
            config={"webhook_url": "https://hooks.slack.com/services/...", "channel": "#ml-alerts"},
            is_active=True,
            created_by=admin_user.id
        )
        db.add(notification_channel)
        
        # Commit all changes
        db.commit()
        
        print("✅ Sample data created successfully!")
        print(f"Organization: {org.name} (ID: {org.id})")
        print(f"Users created: {len([admin_user, data_scientist, ml_engineer])}")
        print(f"Projects created: {len([fraud_detection_project, recommendation_project])}")
        print(f"Models created: {len([fraud_model, recommendation_model])}")
        print(f"Deployments created: 1")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
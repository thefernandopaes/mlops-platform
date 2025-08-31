"""
Inference Service.
Handles model predictions with validation, preprocessing, and postprocessing.
"""

import json
import numpy as np
import pandas as pd
import logging
from typing import List, Dict, Any, Optional, Union, Tuple
from datetime import datetime
import asyncio
import pickle
import joblib
from pathlib import Path

from app.models.deployment import Deployment
from app.schemas.inference import PredictionResult
from app.core.exceptions import ValidationError, ModelError, InferenceError


logger = logging.getLogger(__name__)


class InferenceService:
    """Service for handling model inference operations."""
    
    def __init__(self):
        self.supported_frameworks = {
            'sklearn', 'xgboost', 'lightgbm', 'pytorch', 'tensorflow', 
            'onnx', 'mlflow', 'catboost', 'prophet'
        }
        self.preprocessing_cache = {}
        
    async def validate_input(
        self, 
        instances: List[Dict[str, Any]], 
        model_schema: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Validate input instances against model schema.
        
        Args:
            instances: List of input instances
            model_schema: Model's expected input schema
            
        Returns:
            List of validated and preprocessed instances
            
        Raises:
            ValidationError: If validation fails
        """
        try:
            validated_instances = []
            
            # Get schema requirements
            required_features = model_schema.get('input_schema', {}).get('required', [])
            feature_types = model_schema.get('input_schema', {}).get('properties', {})
            
            for i, instance in enumerate(instances):
                # Check required features
                missing_features = set(required_features) - set(instance.keys())
                if missing_features:
                    raise ValidationError(
                        f"Instance {i}: Missing required features: {missing_features}"
                    )
                
                # Validate feature types and values
                validated_instance = await self._validate_instance_types(
                    instance, feature_types, i
                )
                
                # Apply preprocessing if defined
                if 'preprocessing' in model_schema:
                    validated_instance = await self._apply_preprocessing(
                        validated_instance, model_schema['preprocessing']
                    )
                
                validated_instances.append(validated_instance)
                
            return validated_instances
            
        except Exception as e:
            logger.error(f"Input validation failed: {str(e)}")
            raise ValidationError(f"Input validation failed: {str(e)}")
    
    async def _validate_instance_types(
        self, 
        instance: Dict[str, Any], 
        feature_types: Dict[str, Any], 
        instance_index: int
    ) -> Dict[str, Any]:
        """Validate and convert feature types."""
        validated = {}
        
        for feature, value in instance.items():
            if feature in feature_types:
                expected_type = feature_types[feature].get('type')
                
                try:
                    if expected_type == 'number':
                        validated[feature] = float(value)
                    elif expected_type == 'integer':
                        validated[feature] = int(value)
                    elif expected_type == 'string':
                        validated[feature] = str(value)
                    elif expected_type == 'boolean':
                        validated[feature] = bool(value)
                    elif expected_type == 'array':
                        if not isinstance(value, list):
                            raise ValueError(f"Expected array for {feature}")
                        validated[feature] = value
                    else:
                        validated[feature] = value
                        
                    # Check value constraints
                    await self._validate_constraints(
                        feature, validated[feature], feature_types[feature]
                    )
                    
                except (ValueError, TypeError) as e:
                    raise ValidationError(
                        f"Instance {instance_index}: Invalid type for feature '{feature}': {str(e)}"
                    )
            else:
                # Unknown feature - keep as is but log warning
                logger.warning(f"Unknown feature '{feature}' in instance {instance_index}")
                validated[feature] = value
                
        return validated
    
    async def _validate_constraints(
        self, 
        feature: str, 
        value: Any, 
        constraints: Dict[str, Any]
    ):
        """Validate feature constraints like min, max, enum values."""
        if 'minimum' in constraints and value < constraints['minimum']:
            raise ValidationError(f"Feature '{feature}' value {value} below minimum {constraints['minimum']}")
            
        if 'maximum' in constraints and value > constraints['maximum']:
            raise ValidationError(f"Feature '{feature}' value {value} above maximum {constraints['maximum']}")
            
        if 'enum' in constraints and value not in constraints['enum']:
            raise ValidationError(f"Feature '{feature}' value {value} not in allowed values {constraints['enum']}")
            
        if 'pattern' in constraints and isinstance(value, str):
            import re
            if not re.match(constraints['pattern'], value):
                raise ValidationError(f"Feature '{feature}' value doesn't match pattern {constraints['pattern']}")
    
    async def _apply_preprocessing(
        self, 
        instance: Dict[str, Any], 
        preprocessing_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply preprocessing transformations."""
        processed = instance.copy()
        
        # Apply scaling
        if 'scaling' in preprocessing_config:
            for feature, scale_config in preprocessing_config['scaling'].items():
                if feature in processed:
                    if scale_config['type'] == 'standard':
                        mean = scale_config['mean']
                        std = scale_config['std']
                        processed[feature] = (processed[feature] - mean) / std
                    elif scale_config['type'] == 'minmax':
                        min_val = scale_config['min']
                        max_val = scale_config['max']
                        processed[feature] = (processed[feature] - min_val) / (max_val - min_val)
        
        # Apply encoding
        if 'encoding' in preprocessing_config:
            for feature, encode_config in preprocessing_config['encoding'].items():
                if feature in processed:
                    if encode_config['type'] == 'onehot':
                        # One-hot encoding
                        categories = encode_config['categories']
                        value = processed.pop(feature)
                        for category in categories:
                            processed[f"{feature}_{category}"] = 1 if value == category else 0
                    elif encode_config['type'] == 'label':
                        # Label encoding
                        mapping = encode_config['mapping']
                        processed[feature] = mapping.get(processed[feature], 0)
        
        return processed
    
    async def predict(
        self, 
        model: Any, 
        instances: List[Dict[str, Any]], 
        deployment: Deployment
    ) -> List[Union[Any, PredictionResult]]:
        """
        Make predictions using the loaded model.
        
        Args:
            model: Loaded model object
            instances: Validated input instances
            deployment: Deployment configuration
            
        Returns:
            List of predictions
            
        Raises:
            InferenceError: If prediction fails
        """
        try:
            # Convert instances to appropriate format
            input_data = await self._prepare_model_input(instances, deployment)
            
            # Make predictions based on model framework
            predictions = await self._run_prediction(model, input_data, deployment)
            
            # Postprocess predictions
            processed_predictions = await self._postprocess_predictions(
                predictions, deployment, instances
            )
            
            return processed_predictions
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise InferenceError(f"Model prediction failed: {str(e)}")
    
    async def _prepare_model_input(
        self, 
        instances: List[Dict[str, Any]], 
        deployment: Deployment
    ) -> Union[np.ndarray, pd.DataFrame, List[Dict[str, Any]]]:
        """Prepare input data in the format expected by the model."""
        model_framework = deployment.model_version.framework
        
        if model_framework in ['sklearn', 'xgboost', 'lightgbm', 'catboost']:
            # Convert to DataFrame for tree-based models
            df = pd.DataFrame(instances)
            return df
        elif model_framework in ['pytorch', 'tensorflow']:
            # Convert to numpy array for deep learning models
            # Assume features are in consistent order
            feature_names = list(instances[0].keys())
            data = [[instance[feature] for feature in feature_names] for instance in instances]
            return np.array(data, dtype=np.float32)
        elif model_framework == 'onnx':
            # ONNX expects specific input format
            return self._prepare_onnx_input(instances, deployment)
        else:
            # Default: return as list of dicts
            return instances
    
    def _prepare_onnx_input(
        self, 
        instances: List[Dict[str, Any]], 
        deployment: Deployment
    ) -> Dict[str, np.ndarray]:
        """Prepare input for ONNX models."""
        # This would be customized based on your ONNX model's input signature
        feature_names = list(instances[0].keys())
        data = np.array(
            [[instance[feature] for feature in feature_names] for instance in instances],
            dtype=np.float32
        )
        return {"input": data}
    
    async def _run_prediction(
        self, 
        model: Any, 
        input_data: Any, 
        deployment: Deployment
    ) -> Any:
        """Run the actual model prediction."""
        model_framework = deployment.model_version.framework
        
        try:
            if model_framework in ['sklearn', 'xgboost', 'lightgbm', 'catboost']:
                # Standard scikit-learn API
                predictions = model.predict(input_data)
                # Get probabilities if available
                probabilities = None
                if hasattr(model, 'predict_proba'):
                    try:
                        probabilities = model.predict_proba(input_data)
                    except:
                        probabilities = None
                return {'predictions': predictions, 'probabilities': probabilities}
                
            elif model_framework == 'pytorch':
                import torch
                model.eval()
                with torch.no_grad():
                    if isinstance(input_data, np.ndarray):
                        input_tensor = torch.FloatTensor(input_data)
                    else:
                        input_tensor = input_data
                    predictions = model(input_tensor)
                    return predictions.numpy() if hasattr(predictions, 'numpy') else predictions
                    
            elif model_framework == 'tensorflow':
                predictions = model.predict(input_data)
                return predictions
                
            elif model_framework == 'onnx':
                import onnxruntime as ort
                # Assume model is an ONNX session
                input_name = model.get_inputs()[0].name
                predictions = model.run(None, {input_name: input_data['input']})
                return predictions[0]
                
            else:
                # Generic prediction call
                if hasattr(model, 'predict'):
                    return model.predict(input_data)
                else:
                    raise InferenceError(f"Unsupported model framework: {model_framework}")
                    
        except Exception as e:
            raise InferenceError(f"Model prediction failed: {str(e)}")
    
    async def _postprocess_predictions(
        self, 
        predictions: Any, 
        deployment: Deployment, 
        original_instances: List[Dict[str, Any]]
    ) -> List[Union[Any, PredictionResult]]:
        """Postprocess model predictions into response format."""
        try:
            processed_predictions = []
            
            # Handle different prediction formats
            if isinstance(predictions, dict):
                # Has both predictions and probabilities
                pred_values = predictions.get('predictions', [])
                probabilities = predictions.get('probabilities', None)
            else:
                pred_values = predictions
                probabilities = None
            
            # Convert numpy arrays to Python lists
            if hasattr(pred_values, 'tolist'):
                pred_values = pred_values.tolist()
            if probabilities is not None and hasattr(probabilities, 'tolist'):
                probabilities = probabilities.tolist()
            
            for i, pred in enumerate(pred_values):
                result = PredictionResult(
                    prediction=pred,
                    index=i
                )
                
                # Add probabilities if available
                if probabilities is not None and i < len(probabilities):
                    if deployment.model_version.model.problem_type == 'classification':
                        # Map probabilities to class names if available
                        class_names = deployment.model_version.model_schema.get('output_schema', {}).get('classes', [])
                        if class_names and len(class_names) == len(probabilities[i]):
                            result.probabilities = dict(zip(class_names, probabilities[i]))
                        else:
                            result.probabilities = {f"class_{j}": prob for j, prob in enumerate(probabilities[i])}
                    
                    # Calculate confidence as max probability
                    result.confidence = max(probabilities[i]) if probabilities[i] else None
                
                processed_predictions.append(result)
            
            return processed_predictions
            
        except Exception as e:
            logger.error(f"Postprocessing failed: {str(e)}")
            # Return raw predictions if postprocessing fails
            if hasattr(pred_values, 'tolist'):
                return pred_values.tolist()
            return list(pred_values) if hasattr(pred_values, '__iter__') else [pred_values]
    
    async def explain_prediction(
        self, 
        model: Any, 
        instance: Dict[str, Any], 
        deployment: Deployment
    ) -> Optional[Dict[str, Any]]:
        """
        Generate model explanations using SHAP or similar techniques.
        """
        try:
            import shap
            
            # This is a simplified explanation - would need more sophisticated implementation
            explainer = shap.Explainer(model)
            input_data = await self._prepare_model_input([instance], deployment)
            
            if hasattr(input_data, 'iloc'):
                # DataFrame
                shap_values = explainer(input_data.iloc[0:1])
            else:
                shap_values = explainer(input_data[0:1])
            
            return {
                "shap_values": shap_values.values.tolist(),
                "feature_names": list(instance.keys()),
                "base_value": shap_values.base_values.tolist() if hasattr(shap_values, 'base_values') else None
            }
            
        except Exception as e:
            logger.warning(f"Could not generate explanation: {str(e)}")
            return None
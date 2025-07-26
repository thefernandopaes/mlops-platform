from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_experiments():
    """List experiments."""
    return {"message": "List experiments - to be implemented"}

@router.post("/")
async def create_experiment():
    """Create experiment."""
    return {"message": "Create experiment - to be implemented"}

@router.get("/{experiment_id}")
async def get_experiment(experiment_id: str):
    """Get experiment by ID."""
    return {"message": f"Get experiment {experiment_id} - to be implemented"}

@router.put("/{experiment_id}")
async def update_experiment(experiment_id: str):
    """Update experiment."""
    return {"message": f"Update experiment {experiment_id} - to be implemented"}

@router.delete("/{experiment_id}")
async def delete_experiment(experiment_id: str):
    """Delete experiment."""
    return {"message": f"Delete experiment {experiment_id} - to be implemented"}
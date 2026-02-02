from fastapi import APIRouter

route = APIRouter(prefix="/api/health", tags=["health"])

TIMEOUT_SECONDS = 2.0


@route.get("/")
def health_check():
    gpu_status = "healthy"

    overall_status = "healthy" if gpu_status == "healthy" else "degraded"

    return {
        "status": overall_status,
        "services": {
            "api": "healthy",
            "gpu_service": gpu_status,
        },
    }

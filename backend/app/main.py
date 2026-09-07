import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.config import get_settings
from app.schemas.common import ErrorResponse
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.analyses import router as analyses_router

logger = logging.getLogger(__name__)

settings = get_settings()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - production-safe with local dev fallback in DEMO_MODE
if settings.DEMO_MODE:
    origins = [
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$"
else:
    # Production: strictly allow configured frontend URL(s)
    origins = [url.strip() for url in settings.FRONTEND_URL.split(",") if url.strip()]
    origin_regex = None

cors_kwargs = {
    "allow_origins": origins,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
if origin_regex:
    cors_kwargs["allow_origin_regex"] = origin_regex

app.add_middleware(CORSMiddleware, **cors_kwargs)

# Standardized Error Handler for HTTP Exceptions (unpacks ErrorResponse directly at root level)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict):
        content = dict(exc.detail)
        # Suppress internal error traces for server errors (5xx) in non-demo production
        if not settings.DEMO_MODE and exc.status_code >= 500:
            if "details" in content:
                content["details"] = None
        return JSONResponse(
            status_code=exc.status_code,
            content=content
        )
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            code=f"HTTP_{exc.status_code}",
            message=str(exc.detail)
        ).model_dump()
    )

# Standardized Error Handler for Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    details = {str(err.get("loc", [""])[-1]): err.get("msg", "") for err in errors}
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            code="VALIDATION_ERROR",
            message="Request parameters or body failed schema validation.",
            details=details
        ).model_dump()
    )

# Standardized Global Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected internal server error occurred." if not settings.DEMO_MODE else f"An unexpected internal server error occurred: {str(exc)}",
            details={"error": str(exc)} if settings.DEMO_MODE else None
        ).model_dump()
    )



# Include Routers with /api prefix
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(resumes_router, prefix=settings.API_V1_STR)
app.include_router(analyses_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

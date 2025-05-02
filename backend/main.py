from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes import router as api_router

app = FastAPI()

# Enable CORS to allow frontend (http://localhost:3000) with cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes from the routes module
app.include_router(api_router, tags=["Authentication"])
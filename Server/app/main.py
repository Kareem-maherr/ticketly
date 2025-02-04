from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tickets
from app.database import init_db

app = FastAPI(title="Arab Emergency Ticketing System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update this with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(tickets.router, prefix="/tickets", tags=["tickets"])

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Welcome to Arab Emergency Ticketing System API"}

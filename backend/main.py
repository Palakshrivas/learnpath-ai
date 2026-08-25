from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import profile, chat, recommendations, progress, feedback

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Waypoint ML/LLM Service",
    version="0.2.0",
    description="Profiling, recommendation, and LLM-explanation service. "
                "Auth is handled entirely by the separate Java backend — "
                "this service only verifies the JWT it issues.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to your Java backend / frontend origins before deploying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(chat.router)
app.include_router(recommendations.router)
app.include_router(progress.router)
app.include_router(feedback.router)


@app.get("/health")
def health():
    return {"status": "ok"}

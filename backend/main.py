from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from graph import graph
from db.database import engine
from db.models import Base

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "AI CRM API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/chat")
def chat(data: dict):
    result = graph.invoke({
        "user_input": data["input_text"],
        "data": data.get("form_data", {})
    })

    return {
        "message": result.get("response"),
        "data": result.get("data", {})
    }



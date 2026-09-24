from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from graph import graph
from db.database import engine, SessionLocal
from db.models import Base, Interaction
from io import BytesIO
import re
from groq import APIError

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None

app = FastAPI()


def clean_material_name(value: str) -> str:
    text = (value or "").strip()
    if not text:
        return ""

    text = text.replace("_", " ").replace("-", " ")
    text = re.sub(r"\s+", " ", text)
    text = text.replace(".pdf", "").strip()
    text = re.sub(r"\b(pdf)\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def infer_material_details(filename: str, title: str = "", extracted_text: str = "") -> dict:
    base_name = filename or "uploaded.pdf"
    pdf_name = clean_material_name(base_name)

    title_text = clean_material_name(title) if title else ""

    if title_text and title_text.lower() not in pdf_name.lower():
        material_name = title_text
    else:
        material_name = pdf_name

    material_type = "Document"
    lower_text = (extracted_text or "").lower()

    if "clinical study" in lower_text or "phase iii" in lower_text.lower() or "phase 3" in lower_text.lower():
        material_type = "Clinical Study"
    elif "brochure" in lower_text or "product brochure" in lower_text:
        material_type = "Brochure"
    elif "safety" in lower_text or "safety information" in lower_text:
        material_type = "Safety Information"
    elif "protocol" in lower_text:
        material_type = "Protocol"

    if not material_name or material_name.lower() == "uploaded":
        material_name = pdf_name

    return {
        "filename": base_name,
        "document_title": title_text or material_name,
        "material_type": material_type,
        "material_name": material_name,
        "extracted_text": extracted_text[:12000],
        "status": "success"
    }


async def extract_pdf_details(file: UploadFile) -> dict:
    filename = file.filename or "document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")

    title = ""
    extracted_text = ""

    if PdfReader is None:
        raise HTTPException(status_code=503, detail="PDF processing is unavailable. Install the pypdf package and restart the API.")

    try:
        reader = PdfReader(BytesIO(content))
        if reader.metadata:
            title = reader.metadata.title or ""

        pages = reader.pages[:5]
        extracted_text = "\n".join(
            (page.extract_text() or "") for page in pages
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail="This file is not a readable PDF. Please choose a valid PDF file.") from exc

    return infer_material_details(filename, title, extracted_text)

def ensure_interaction_columns():
    with engine.begin() as conn:
        inspector = inspect(conn)
        existing_cols = [col["name"] for col in inspector.get_columns("interactions")]
        columns = {
            "outcomes": "VARCHAR",
            "materials": "VARCHAR",
            "ai_suggestions": "VARCHAR",
            "attachment_name": "VARCHAR",
            "attachment_metadata": "VARCHAR",
        }

        for col_name, col_type in columns.items():
            if col_name not in existing_cols:
                conn.execute(text(f"ALTER TABLE interactions ADD COLUMN {col_name} {col_type}"))


# Initialize database tables (with error handling)
@app.on_event("startup")
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        ensure_interaction_columns()
        print("✓ Database tables created successfully")
    except Exception as e:
        print(f"⚠ Database connection failed: {e}")
        print("  The app will continue, but database operations may fail")

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
    form_data = data.get("form_data", {}) or {}
    if data.get("pdf_contexts"):
        form_data["pdf_contexts"] = data.get("pdf_contexts")
    if data.get("attachment_names"):
        form_data["attachment_names"] = data.get("attachment_names")
    if data.get("attachment_metadata"):
        form_data["attachment_metadata"] = data.get("attachment_metadata")

    try:
        result = graph.invoke({
            "user_input": data.get("message") or data.get("input_text"),
            "data": form_data
        })
    except APIError as exc:
        raise HTTPException(
            status_code=502,
            detail="The AI provider rejected the request. Check GROQ_MODEL and GROQ_API_KEY, then restart the backend."
        ) from exc

    return {
        "message": result.get("response"),
        "data": result.get("data") or {}
    }

@app.post("/api/upload-pdf")
async def upload_pdf_api(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        result = await extract_pdf_details(file)
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to process this PDF: {exc}") from exc


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    return await upload_pdf_api(file)


@app.post("/submit")
def submit_interaction(data: dict):
    form_data = data.get("form_data") or data

    if not form_data:
        raise HTTPException(status_code=400, detail="No form data provided")

    db = SessionLocal()
    try:
        ai_suggestions = form_data.get("ai_suggestions")
        if isinstance(ai_suggestions, list):
            ai_suggestions_text = "; ".join(ai_suggestions)
        else:
            ai_suggestions_text = ai_suggestions

        attachment_names = form_data.get("attachment_names")
        if isinstance(attachment_names, list):
            attachment_names_text = "; ".join(attachment_names)
        else:
            attachment_names_text = attachment_names

        attachment_metadata = form_data.get("attachment_metadata")
        if isinstance(attachment_metadata, list):
            attachment_metadata_text = "; ".join(str(item) for item in attachment_metadata)
        elif attachment_metadata is not None:
            attachment_metadata_text = str(attachment_metadata)
        else:
            attachment_metadata_text = None

        interaction = Interaction(
            hcp_name=form_data.get("hcp_name"),
            date=form_data.get("date"),
            time=form_data.get("time"),
            interaction_type=form_data.get("interaction_type"),
            attendees=form_data.get("attendees"),
            topics=form_data.get("topics"),
            sentiment=form_data.get("sentiment"),
            follow_up=form_data.get("follow_up"),
            outcomes=form_data.get("outcomes"),
            materials=form_data.get("materials"),
            ai_suggestions=ai_suggestions_text,
            attachment_name=attachment_names_text,
            attachment_metadata=attachment_metadata_text,
        )

        db.add(interaction)
        db.commit()
        db.refresh(interaction)

        return {
            "message": "Interaction saved successfully",
            "id": interaction.id
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unable to save interaction: {exc}"
        ) from exc
    finally:
        db.close()



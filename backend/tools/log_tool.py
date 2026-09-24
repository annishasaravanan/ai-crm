import datetime
from llm import llm
from utils.json_parser import extract_json


def log_interaction_tool(state):
    now = datetime.datetime.now()
    form_data = state.get("data", {}) or {}
    pdf_contexts = form_data.get("pdf_contexts") or []

    pdf_context_text = ""
    if pdf_contexts:
        parts = []
        for pdf in pdf_contexts:
            if not isinstance(pdf, dict):
                continue
            details = []
            if pdf.get("filename"):
                details.append(f"Filename: {pdf.get('filename')}")
            if pdf.get("document_title"):
                details.append(f"Document title: {pdf.get('document_title')}")
            if pdf.get("material_type"):
                details.append(f"Material type: {pdf.get('material_type')}")
            if pdf.get("material_name"):
                details.append(f"Material name: {pdf.get('material_name')}")
            if pdf.get("extracted_text"):
                details.append(f"Extracted PDF text: {pdf.get('extracted_text')[:2000]}")
            if details:
                parts.append("\n".join(details))
        pdf_context_text = "\n\n".join(parts)

    prompt = f"""
    Extract structured data from the user input and any attached PDF context.
    User input: "{state['user_input']}"

    PDF context:
    {pdf_context_text if pdf_context_text else "No PDF context provided."}

    Use the PDF information only to fill relevant fields such as Materials Shared and Topics Discussed.
    Do not invent information not present in the text or PDF.

    Return ONLY JSON:
    {{
        "hcp_name": "",
        "interaction_type": "Meeting",
        "attendees": "",
        "topics": "",
        "sentiment": "",
        "follow_up": "",
        "outcomes": "",
        "materials": ""
    }}
    """

    res = llm.invoke(prompt)
    data = extract_json(res.content)

    # ✅ AUTO DATE & TIME
    data["date"] = now.strftime("%Y-%m-%d")
    data["time"] = now.strftime("%H:%M")

    if pdf_context_text and not data.get("materials"):
        material_names = []
        for pdf in pdf_contexts:
            material = pdf.get("material_name") or pdf.get("filename")
            if material:
                material_names.append(str(material))
        if material_names:
            data["materials"] = ", ".join(material_names)

    response_text = (
        "✅ **1. Log Interaction Tool**\n"
        "Extracting full data from text and any attached PDF context.\n\n"
        "**Interaction logged successfully!** The details (HCP Name, Date, Sentiment, and Materials) "
        "have been automatically populated based on your summary and PDF context. "
        "Would you like me to suggest a specific follow-up action?"
    )

    return {
        "response": response_text,
        "data": data
    }
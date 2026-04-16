import datetime
from llm import llm
from utils.json_parser import extract_json

def log_interaction_tool(state):
    now = datetime.datetime.now()

    prompt = f"""
    Extract structured data from the user input:
    "{state['user_input']}"

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

    response_text = (
        "✅ **1. Log Interaction Tool**\n"
        "Extracting full data from text and populating the entire form.\n\n"
        "**Interaction logged successfully!** The details (HCP Name, Date, Sentiment, and Materials) "
        "have been automatically populated based on your summary. "
        "Would you like me to suggest a specific follow-up action?"
    )

    return {
        "response": response_text,
        "data": data
    }
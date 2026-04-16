from llm import llm
from utils.json_parser import extract_json

def edit_interaction_tool(state):
    prompt = f"""
    You are an AI assistant for a healthcare CRM. 
    The user wants to CORRECT or UPDATE some fields in the current form.

    CURRENT FORM DATA:
    {state.get('data', {})}

    USER REQUEST:
    "{state['user_input']}"

    TASK:
    1. Identify EVERY field the user mentioned or wants to change.
    2. Respond with ONLY a raw JSON object containing the updated values.
    
    Example:
    If user says "Name is actually Dr. Smith and he is positive", return:
    {{"hcp_name": "Dr. Smith", "sentiment": "Positive"}}
    """

    res = llm.invoke(prompt)
    updated_fields = extract_json(res.content)

    # Merge updates with existing data
    current_data = state.get('data', {})
    merged_data = {**current_data, **updated_fields}

    response_text = (
        "✅ **2. Edit Interaction Tool**\n"
        "Updating the requested fields while preserving the rest of the form.\n\n"
        "**Form updated successfully!** fields updated: " + ", ".join(updated_fields.keys())
    )

    return {
        "response": response_text,
        "data": merged_data
    }
from llm import llm
from utils.json_parser import extract_json

def followup_tool(state):
    prompt = f"""
    Suggest follow-up actions based on this interaction:
    "{state['user_input']}"

    Also consider current data: {state.get('data', {})}
    
    Return ONLY a valid JSON object:
    {{
        "main_action": "Primary follow-up action",
        "suggestions": ["Option 1", "Option 2", "Option 3"]
    }}
    """
    res = llm.invoke(prompt)
    data = extract_json(res.content)

    response_text = (
        "✅ **5. Follow-up Tool**\n"
        "Suggesting next steps and follow-up actions based on the meeting.\n\n"
        "**Follow-up suggestions generated!** I've added the primary action to the form and listed some "
        "additional suggestions for you."
    )
    
    return {
        "response": response_text,
        "data": {
            "follow_up": data.get("main_action", ""),
            "ai_suggestions": data.get("suggestions", [])
        }
    }
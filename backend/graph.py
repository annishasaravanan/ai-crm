from typing import TypedDict, Optional
from langgraph.graph import StateGraph
from llm import llm
from tools.log_tool import log_interaction_tool
from tools.edit_tool import edit_interaction_tool
from tools.sentiment_tool import sentiment_tool
from tools.summarize_tool import summarize_tool
from tools.followup_tool import followup_tool

class State(TypedDict):
    user_input: str
    response: Optional[str]
    data: Optional[dict]

def router_logic(state: State):
    prompt = f"""
    Classify the user intent for a Healthcare CRM:
    "{state['user_input']}"

    Categories:
    - log: First time logging an interaction or providing new details.
    - edit: Correcting a mistake, updating a field, or saying "Sorry, the name is...", "Change the date to...", "Actually...".
    - sentiment: Specifically asking "What is the sentiment?" or "Analyze the mood".
    - summarize: Asking for a summary or discussion points.
    - followup: Asking for next steps or suggestions.

    Return ONLY the category name (one word).
    """
    res = llm.invoke(prompt)
    intent = res.content.strip().lower()
    valid_intents = ["log", "edit", "sentiment", "summarize", "followup"]
    return intent if intent in valid_intents else "log"

builder = StateGraph(State)

builder.add_node("log", log_interaction_tool)
builder.add_node("edit", edit_interaction_tool)
builder.add_node("sentiment", sentiment_tool)
builder.add_node("summarize", summarize_tool)
builder.add_node("followup", followup_tool)

builder.set_conditional_entry_point(
    router_logic,
    {
        "log": "log",
        "edit": "edit",
        "sentiment": "sentiment",
        "summarize": "summarize",
        "followup": "followup"
    }
)

graph = builder.compile()
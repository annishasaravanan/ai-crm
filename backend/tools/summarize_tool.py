from llm import llm

def summarize_tool(state):
    prompt = f"Convert the following interaction into key discussion topics for a CRM. Return ONLY the summarized points: {state['user_input']}"
    res = llm.invoke(prompt)
    summary = res.content.strip()

    response_text = (
        "✅ **4. Summarize Tool**\n"
        "Converting long text into concise discussion topics.\n\n"
        "**Summary generated!** I've updated the 'Topics Discussed' section with the key points from your note."
    )

    return {
        "response": response_text,
        "data": {"topics": summary}
    }
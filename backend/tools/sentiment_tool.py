from llm import llm

def sentiment_tool(state):
    prompt = f"Detect mood/sentiment (Positive/Neutral/Negative) for this interaction: {state['user_input']}. Return ONLY the label."
    res = llm.invoke(prompt)
    sentiment = res.content.strip()

    response_text = (
        "✅ **3. Sentiment Tool**\n"
        "Analyzing user sentiment from the interaction text.\n\n"
        f"**Sentiment detected as {sentiment}.** I have updated the sentiment field in the form for you."
    )

    return {
        "response": response_text,
        "data": {"sentiment": sentiment}
    }
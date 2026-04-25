# 🤖 AI-First CRM – HCP Interaction Module

## 📌 Overview

This project is an **AI-first CRM system** designed for pharmaceutical field representatives to log and manage Healthcare Professional (HCP) interactions.

The system allows users to **log interactions using natural language via an AI assistant**, which automatically fills and updates a structured CRM form.

---

## 🚀 Key Features

### ✅ AI-Controlled Form

* Users **do not manually fill forms**
* AI assistant extracts structured data from natural language
* Form is automatically populated using Redux state

---

### 🧠 LangGraph AI Agent

The system uses a **LangGraph-based AI agent** as a decision engine to:

* Understand user input
* Route to appropriate tools
* Maintain state
* Return structured data

---

## 🛠️ Implemented Tools (LangGraph)

### 1️⃣ Log Interaction Tool

* Converts free text into structured CRM data
* Extracts HCP name, topics, sentiment, follow-up
* Automatically fills entire form including date & time

---

### 2️⃣ Edit Interaction Tool

* Updates only modified fields
* Preserves existing data
* Uses state merging logic

---

### 3️⃣ Sentiment Tool

* Detects sentiment (Positive / Neutral / Negative)
* Updates only sentiment field

---

### 4️⃣ Summarize Tool

* Converts long conversations into key discussion points
* Updates "Topics Discussed"

---

### 5️⃣ Follow-up Tool

* Suggests next actions
* Updates follow-up field

---

## 🧩 Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Axios
* Google Inter Font

### Backend

* FastAPI
* LangGraph
* LangChain + Groq LLM

### LLM

* Groq API (`llama-3.3-70b-versatile`)

### Database

* PostgreSQL

---

## 🔄 System Workflow

User Input → AI Assistant → LangGraph Agent → Tool Execution → JSON Output → Redux → Form Auto-Fill

---

## 📦 Installation Guide

---

### 🔹 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install fastapi uvicorn langchain langgraph langchain-groq sqlalchemy psycopg2-binary python-dotenv
```

---

### 🔹 Create `.env`

```env
GROQ_API_KEY=your_api_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_crm
```

---

### 🔹 Run Backend

```bash
uvicorn main:app --reload
```

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Example Usage

### Input (AI Assistant)

```
Met Dr Ravi, discussed product, positive response, follow up next week
```

### Output

* HCP Name → Dr Ravi
* Topics → discussed product
* Sentiment → Positive
* Follow-up → next week
* Date & Time → auto-filled

---

### Edit Example

```
Sorry name is Dr John and sentiment is negative
```

👉 Only updated fields change

---

## 🎯 Key Highlights

* Fully AI-driven UI (no manual form entry)
* LLM-based intent classification (no hardcoding)
* Robust JSON extraction
* Real-time UI updates via Redux
* Modular LangGraph tool architecture

---

## 📌 Conclusion

This project demonstrates how AI agents can replace traditional form-based workflows by enabling **natural language-driven CRM systems**, improving efficiency and user experience.

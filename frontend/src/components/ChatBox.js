import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAIData, setResponse } from "../redux/slice";


export default function ChatBox() {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([
        { type: "info", content: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.' }
    ]);
    const dispatch = useDispatch();

    const form = useSelector((state) => state.crm.form);

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const userMsg = { type: "user", content: input };
        setHistory(prev => [...prev, userMsg]);
        setInput("");

        try {
            const res = await axios.post("http://localhost:8000/chat", {
                input_text: input,
                form_data: form // 🔥 This sends the current form state to AI
            });

            const aiMsg = { type: "success", content: res.data.message || "Updated." };
            setHistory(prev => [...prev, aiMsg]);
            
            if (res.data.data) {
                dispatch(setAIData(res.data.data));
            }
            dispatch(setResponse(res.data.message));
        } catch (err) {
            console.error(err);
        }
    };



    return (
        <div className="card" style={{ height: "100%", padding: "24px" }}>
            <div className="sidebar-title">
                <span style={{ fontSize: "1.2rem" }}>🤖</span> AI Assistant
            </div>
            <div className="sidebar-subtitle">Log interaction details here via chat</div>

            <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
                {history.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble bubble-${msg.type}`}>
                        {msg.type === "success" && <span style={{ marginRight: "8px" }}>✅</span>}
                        {msg.content}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <textarea
                    placeholder="Describe Interaction..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ flex: 1, minHeight: "60px", padding: "12px", borderRadius: "12px", background: "#fff" }}
                />
                <button className="circular-btn" onClick={sendMessage}>
                    <span style={{ fontSize: "1.2rem" }}>🤖</span>
                    <span>Log</span>
                </button>
            </div>
        </div>
    );
}


import { useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAIData, setResponse } from "../redux/slice";

export default function ChatBox() {
    const [input, setInput] = useState("");
    const [listening, setListening] = useState(false);
    const [lang, setLang] = useState("en-IN");
    const [history, setHistory] = useState([
        { type: "info", content: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy") or ask for help.' }
    ]);

    const dispatch = useDispatch();
    const form = useSelector((state) => state.crm.form);
    const recognitionRef = useRef(null);

    // 🎤 START VOICE
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            setInput(text);
            
            // Auto-send voice result
            handleChat(text);
        };

        recognition.onerror = (e) => {
            console.error(e);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    // 🛑 STOP VOICE
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setListening(false);
    };

    const handleChat = async (text) => {
        if (!text.trim()) return;

        const userMsg = { type: "user", content: text };
        setHistory(prev => [...prev, userMsg]);
        setInput("");

        try {
            const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/chat`, {
                message: text,
                form_data: form
            });

            const aiMsg = { type: "success", content: res.data.message || "Updated successfully." };
            setHistory(prev => [...prev, aiMsg]);

            if (res.data.data) {
                dispatch(setAIData(res.data.data));
            }
            dispatch(setResponse(res.data.message));
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = () => handleChat(input);

    return (
        <div className="card" style={{ height: "100%", padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div className="sidebar-title">
                    <span style={{ fontSize: "1.2rem" }}>🤖</span> AI Assistant
                </div>
                <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className="lang-select"
                    style={{ 
                        width: "auto", 
                        padding: "4px 10px", 
                        borderRadius: "20px", 
                        background: "#f3f4f6", 
                        border: "1px solid var(--border)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "#4b5563",
                        cursor: "pointer"
                    }}
                >
                    <option value="en-IN">🇺🇸 English</option>
                    <option value="ta-IN">🇮🇳 Tamil</option>
                </select>
            </div>
            
            <div className="sidebar-subtitle" style={{ marginTop: "-12px", marginBottom: "20px" }}>
                Log interaction details via voice or text
            </div>

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
                    placeholder={listening ? "Listening..." : "Describe Interaction..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ 
                        flex: 1, 
                        minHeight: "60px", 
                        padding: "12px", 
                        borderRadius: "12px", 
                        background: "#fff",
                        border: listening ? "2px solid #3b82f6" : "1px solid var(--border)",
                        boxShadow: listening ? "0 0 10px rgba(59, 130, 246, 0.2)" : "none",
                        transition: "all 0.3s ease",
                        resize: "none"
                    }}
                />
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {!listening ? (
                        <button className="circular-btn" onClick={startListening} style={{ background: "#4b5563" }}>
                            <span style={{ fontSize: "1.2rem" }}>🎤</span>
                            <span style={{ fontSize: "0.5rem", fontWeight: "bold" }}>Voice</span>
                        </button>
                    ) : (
                        <button className="circular-btn listening-pulse" onClick={stopListening} style={{ background: "#ef4444" }}>
                            <span style={{ fontSize: "1.2rem" }}>🛑</span>
                            <span style={{ fontSize: "0.5rem", fontWeight: "bold" }}>Stop</span>
                        </button>
                    )}
                    
                    <button className="circular-btn" onClick={sendMessage}>
                        <span style={{ fontSize: "1.2rem" }}>🤖</span>
                        <span style={{ fontSize: "0.5rem", fontWeight: "bold" }}>Log</span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulse-red {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .listening-pulse {
                    animation: pulse-red 1.5s infinite;
                }
                .chat-bubble {
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}




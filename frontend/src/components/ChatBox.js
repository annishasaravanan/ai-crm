import { useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAIData, setResponse } from "../redux/slice";

const normalizeMaterial = (value) => (value || "").replace(/\s+/g, " ").trim();

const mergeMaterials = (currentMaterials, newMaterial) => {
    const normalizedNew = normalizeMaterial(newMaterial);
    if (!normalizedNew) return currentMaterials || "";

    const existing = (currentMaterials || "")
        .split(/[;,]/)
        .map((item) => normalizeMaterial(item))
        .filter(Boolean);

    const alreadyExists = existing.some(
        (item) => item.toLowerCase() === normalizedNew.toLowerCase()
    );

    if (alreadyExists) {
        return currentMaterials || "";
    }

    return [...existing, normalizedNew].join(", ");
};

const removeMaterial = (currentMaterials, materialToRemove) => {
    const normalizedTarget = normalizeMaterial(materialToRemove);
    if (!normalizedTarget) return currentMaterials || "";

    const existing = (currentMaterials || "")
        .split(/[;,]/)
        .map((item) => normalizeMaterial(item))
        .filter(Boolean)
        .filter((item) => item.toLowerCase() !== normalizedTarget.toLowerCase());

    return existing.join(", ");
};

export default function ChatBox() {
    const [input, setInput] = useState("");
    const [listening, setListening] = useState(false);
    const [lang, setLang] = useState("en-IN");
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [history, setHistory] = useState([
        { type: "info", content: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy") or ask for help.' }
    ]);

    const dispatch = useDispatch();
    const form = useSelector((state) => state.crm.form);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const processAttachments = async () => {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
        const results = [];

        for (const attachment of attachments) {
            const pdfFile = attachment.file;
            if (!pdfFile || (!pdfFile.type.includes("pdf") && !pdfFile.name.toLowerCase().endsWith(".pdf"))) {
                throw new Error("Unsupported file type. Please upload only PDF files.");
            }

            const formData = new FormData();
            formData.append("file", pdfFile);

            const res = await axios.post(`${API_URL}/api/upload-pdf`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            const payload = res.data || {};
            const materialName = payload.material_name || payload.filename || pdfFile.name;

            if (materialName) {
                results.push({
                    filename: payload.filename || pdfFile.name,
                    material_name: materialName,
                    material_type: payload.material_type || "Document",
                    document_title: payload.document_title || materialName,
                    extracted_text: payload.extracted_text || "",
                    status: payload.status || "success"
                });

            }
        }

        return results;
    };

    const handleChat = async (text) => {
        if (!text.trim() && attachments.length === 0) return;

        const userMsg = { type: "user", content: text || "Attached PDF" };
        setHistory(prev => [...prev, userMsg]);
        setInput("");

        try {
            setUploading(true);
            setStatusMessage("Uploading and processing PDF...");
            setErrorMessage("");

            const pdfContexts = attachments.length ? await processAttachments() : [];
            const uploadedMaterials = pdfContexts
                .map((pdf) => pdf.material_name || pdf.filename)
                .filter(Boolean);

            const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
            const res = await axios.post(`${API_URL}/chat`, {
                message: text,
                form_data: form,
                pdf_contexts: pdfContexts,
                attachment_names: attachments.map((item) => item.name),
                attachment_metadata: pdfContexts
            });

            const aiMsg = { type: "success", content: res.data.message || "Updated successfully." };
            setHistory(prev => [...prev, aiMsg]);

            if (res.data.data) {
                const assistantData = res.data.data;
                dispatch(setAIData({
                    ...assistantData,
                    materials: mergeMaterials(
                        assistantData.materials || form.materials,
                        uploadedMaterials.join(", ")
                    )
                }));
            }
            dispatch(setResponse(res.data.message));
            setAttachments([]);
            setStatusMessage(attachments.length ? "PDF content added to the assistant and form." : "Interaction processed successfully.");
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            setErrorMessage(detail || err.message || "Unable to process this request. Please try again.");
            setStatusMessage("");
        } finally {
            setUploading(false);
        }
    };

    const sendMessage = () => handleChat(input);

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelection = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (!selectedFiles.length) return;

        const invalidFiles = selectedFiles.filter(
            (file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")
        );

        if (invalidFiles.length > 0) {
            setErrorMessage("Unsupported file type. Please upload only PDF files.");
        }

        const validFiles = selectedFiles.filter(
            (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        );

        const dedupedFiles = validFiles.filter((file) =>
            !attachments.some((item) => item.name.toLowerCase() === file.name.toLowerCase())
        );

        if (dedupedFiles.length > 0) {
            setAttachments((prev) => [
                ...prev,
                ...dedupedFiles.map((file) => ({
                    id: `${file.name}-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    file
                }))
            ]);
            setStatusMessage("PDF attached. Submit to process.");
            setErrorMessage("");
        }

        event.target.value = "";
    };

    const removeAttachment = (attachment) => {
        setAttachments((prev) => prev.filter((item) => item.id !== attachment.id));
        setStatusMessage("");
        setErrorMessage("");
    };

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

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                {attachments.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {attachments.map((attachment) => (
                            <div key={attachment.id} style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#eef2ff",
                                border: "1px solid #c7d2fe",
                                borderRadius: "999px",
                                padding: "6px 10px",
                                fontSize: "0.75rem",
                                color: "#1f2937"
                            }}>
                                <span>� {attachment.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment)}
                                    aria-label={`Remove ${attachment.name}`}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "#374151",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        lineHeight: 1
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {(uploading || statusMessage || errorMessage) && (
                    <div style={{ fontSize: "0.75rem", color: uploading ? "#2563eb" : errorMessage ? "#b91c1c" : "#15803d" }}>
                        {uploading ? "Processing PDF..." : errorMessage || statusMessage}
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    hidden
                    onChange={handleFileSelection}
                />

                <button
                    type="button"
                    title="Attach PDF"
                    onClick={handleAttachmentClick}
                    style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "999px",
                        border: "1px solid var(--border)",
                        background: "#f3f4f6",
                        color: "#111827",
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0
                    }}
                >
                    +
                </button>

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




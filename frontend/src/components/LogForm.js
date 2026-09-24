import { useSelector } from "react-redux";
import axios from "axios";
import { useState } from "react";

export default function LogForm() {
    const form = useSelector((state) => state.crm.form);
    const [submitError, setSubmitError] = useState("");

    const handleSubmit = async () => {
        if (!form || Object.keys(form).length === 0) {
            return;
        }

        try {
            setSubmitError("");
            const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
            await axios.post(`${API_URL}/submit`, {
                form_data: form
            });
            window.alert("Interaction saved successfully.");
        } catch (error) {
            console.error("Submit failed:", error);
            const detail = error.response?.data?.detail;
            setSubmitError(detail || "Failed to save interaction. Please try again.");
        }
    };

    return (
        <div className="card">
            <div className="section-title">Interaction Details</div>

            <div className="form-row">
                <div className="form-group">
                    <label>HCP Name</label>
                    <input 
                        placeholder="Search or select HCP..." 
                        value={form.hcp_name || ""} 
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label>Interaction Type</label>
                    <select value={form.interaction_type || ""} disabled>
                        <option value="">Select interaction type</option>
                        <option>Meeting</option>
                        <option>Call</option>
                        <option>Email</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Date</label>
                    <input 
                        type="date" 
                        value={form.date || ""} 
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label>Time</label>
                    <input 
                        type="time" 
                        value={form.time || ""} 
                        readOnly
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Attendees</label>
                <input 
                    placeholder="Enter names or search..." 
                    style={{ background: "#fcfcfc" }} 
                    value={form.attendees || ""}
                    readOnly
                />
            </div>

            <div className="form-group">
                <label>Topics Discussed</label>
                <div style={{ position: "relative" }}>
                    <textarea 
                        placeholder="Enter key discussion points..." 
                        rows="4" 
                        style={{ background: "#fcfcfc" }} 
                        value={form.topics || ""}
                        readOnly
                    />
                    <span style={{ position: "absolute", left: "10px", bottom: "-25px", fontSize: "0.75rem", color: "#6b7280" }}>🎙️ Summarize from Voice Note (Requires Consent)</span>
                </div>
            </div>

            <div style={{ marginTop: "40px" }} className="form-group">
                <label>Materials Shared / Samples Distributed</label>
                <div className="section-title" style={{ border: "none", marginBottom: "4px" }}>Materials Shared</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfcfc", border: "1px solid var(--border)", padding: "10px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{form.materials || ""}</span>
                    <button className="btn-secondary">🔍 Search/Add</button>
                </div>
            </div>

            <div className="form-group">
                <label>Observed/Inferred HCP Sentiment</label>
                <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                    <label className="sentiment-option">
                        <input type="radio" name="sent" checked={form.sentiment?.toLowerCase() === "positive"} readOnly /> 😃 Positive
                    </label>
                    <label className="sentiment-option">
                        <input type="radio" name="sent" checked={form.sentiment?.toLowerCase() === "neutral" || !form.sentiment} readOnly /> 😐 Neutral
                    </label>
                    <label className="sentiment-option">
                        <input type="radio" name="sent" checked={form.sentiment?.toLowerCase() === "negative"} readOnly /> 🙁 Negative
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>Outcomes</label>
                <textarea 
                    placeholder="Key outcomes or agreements..." 
                    rows="2" 
                    style={{ background: "#fcfcfc" }} 
                    value={form.outcomes || ""}
                    readOnly
                />
            </div>

            <div className="form-group">
                <label>Follow-up Actions</label>
                <textarea 
                    placeholder="Enter next steps or tasks..." 
                    rows="2" 
                    style={{ background: "#fcfcfc" }} 
                    value={form.follow_up || ""}
                    readOnly
                />
            </div>

            <div className="form-group">
                <label style={{ color: "#3b82f6" }}>AI Suggested Follow-ups:</label>
                {Array.isArray(form.ai_suggestions) && form.ai_suggestions.length > 0 ? (
                    form.ai_suggestions.map((s, i) => <div key={i} className="ai-suggestion">+ {s}</div>)
                ) : (
                    <div className="ai-suggestion">No suggestions yet</div>
                )}
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
                {submitError && <div role="alert" style={{ color: "#b91c1c", marginBottom: "12px" }}>{submitError}</div>}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!form || Object.keys(form).length === 0}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        borderRadius: "10px",
                        background: "#2563eb",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        cursor: !form || Object.keys(form).length === 0 ? "not-allowed" : "pointer",
                        opacity: !form || Object.keys(form).length === 0 ? 0.6 : 1
                    }}
                >
                    Submit Interaction
                </button>
            </div>
        </div>
    );
}

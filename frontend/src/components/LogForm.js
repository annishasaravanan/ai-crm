import { useSelector } from "react-redux";

export default function LogForm() {
    const form = useSelector((state) => state.crm.form);
    const response = useSelector((state) => state.crm.response);

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
                    <select value={form.interaction_type || "Meeting"} disabled>
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
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{form.materials || "None."}</span>
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
                {form.ai_suggestions ? (
                    form.ai_suggestions.map((s, i) => <div key={i} className="ai-suggestion">+ {s}</div>)
                ) : (
                    <>
                        <div className="ai-suggestion">+ Schedule follow-up meeting in 2 weeks</div>
                        <div className="ai-suggestion">+ Send OncoBoost Phase III PDF</div>
                        <div className="ai-suggestion">+ Add Dr. Sharma to advisory board invite list</div>
                    </>
                )}
            </div>
        </div>
    );
}

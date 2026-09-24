import { useState } from "react";
import LogForm from "./LogForm";
import ChatBox from "./ChatBox";

const leads = [];
const tasks = [];

export default function Layout() {
    const [activeView, setActiveView] = useState("Overview");
    const [leadItems, setLeadItems] = useState(leads);
    const [leadName, setLeadName] = useState("");
    const [leadCompany, setLeadCompany] = useState("");
    const [leadStatus, setLeadStatus] = useState("New");
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [taskItems, setTaskItems] = useState(tasks);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskPriority, setTaskPriority] = useState("Medium");
    const [showTaskForm, setShowTaskForm] = useState(false);

    const addTask = (event) => {
        event.preventDefault();
        const title = taskTitle.trim();
        if (!title) return;

        setTaskItems((currentTasks) => [
            ...currentTasks,
            {
                id: `${Date.now()}-${title}`,
                title,
                meta: taskDate || "No due date",
                priority: taskPriority
            }
        ]);
        setTaskTitle("");
        setTaskDate("");
        setTaskPriority("Medium");
        setShowTaskForm(false);
    };

    const removeTask = (taskId) => {
        setTaskItems((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    };

    const addLead = (event) => {
        event.preventDefault();
        const name = leadName.trim();
        const company = leadCompany.trim();
        if (!name || !company) return;

        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        setLeadItems((currentLeads) => [
            ...currentLeads,
            {
                id: `${Date.now()}-${name}`,
                name,
                company,
                status: leadStatus,
                initials
            }
        ]);
        setLeadName("");
        setLeadCompany("");
        setLeadStatus("New");
        setShowLeadForm(false);
    };

    const removeLead = (leadId) => {
        setLeadItems((currentLeads) => currentLeads.filter((lead) => lead.id !== leadId));
    };

    const leadStatuses = ["New", "Contacted", "Qualified", "Won", "Lost"];
    const pipelineCounts = leadStatuses.map((status) => ({
        status,
        count: leadItems.filter((lead) => lead.status === status).length
    }));
    const totalLeads = leadItems.length;
    const wonLeads = leadItems.filter((lead) => lead.status === "Won").length;
    const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;
    const maxPipelineCount = Math.max(...pipelineCounts.map((item) => item.count), 1);

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="brand-mark"><span>O</span> orbit<span className="brand-dot">.</span></div>
                <div className="workspace-label">WORKSPACE</div>
                <div className="workspace-switcher"><span className="workspace-avatar">W</span><span>Workspace</span><span className="chevron">v</span></div>
                <nav className="nav-list" aria-label="Main navigation">
                    {["Overview", "Leads", "Tasks", "Analytics"].map((view) => (
                        <button key={view} className={`nav-item ${activeView === view ? "active" : ""}`} onClick={() => setActiveView(view)}>
                            <span className="nav-icon">{view === "Overview" ? "O" : view === "Leads" ? "L" : view === "Tasks" ? "T" : "A"}</span>{view}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <button className="nav-item"><span className="nav-icon">S</span>Settings</button>
                    <div className="user-chip"><span className="user-avatar">U</span><span><strong>User</strong><small>Account</small></span><span className="more">...</span></div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div><span className="eyebrow">{activeView.toUpperCase()}</span><h1>{activeView}</h1></div>
                    <div className="topbar-actions"><button className="icon-button" aria-label="Notifications">*</button><button className="primary-button" onClick={() => { if (activeView === "Tasks") { setShowTaskForm(true); } else if (activeView === "Leads") { setShowLeadForm(true); } else { setActiveView("Leads"); setShowLeadForm(true); } }}>{activeView === "Tasks" ? "+ Add task" : "+ Add lead"}</button></div>
                </header>

                {activeView === "Overview" && <>
                    <section className="command-banner">
                        <div><span className="command-kicker">AI COMMAND CENTER</span><h2>Talk to your CRM</h2><p>Capture a lead, schedule a follow-up, or update a record in plain English.</p></div>
                        <button className="command-button" onClick={() => document.querySelector("textarea")?.focus()}>Open assistant <span>{"->"}</span></button>
                    </section>
                    <section className="metric-grid" aria-label="CRM metrics">
                        <div className="metric-card"><span>Total pipeline</span><strong>{leadItems.length}</strong></div>
                        <div className="metric-card"><span>Active leads</span><strong>{leadItems.filter((lead) => lead.status !== "Won" && lead.status !== "Lost").length}</strong></div>
                        <div className="metric-card"><span>Conversion rate</span><strong>{conversionRate}%</strong></div>
                        <div className="metric-card"><span>Open tasks</span><strong>{taskItems.length}</strong></div>
                    </section>
                    <section className="workspace-grid">
                        <div className="panel pipeline-panel">
                            <div className="panel-heading"><div><span className="eyebrow">PIPELINE</span><h2>Lead activity</h2></div><button className="text-button" onClick={() => setActiveView("Leads")}>View all</button></div>
                            {leadItems.length === 0 ? <div className="empty-column">No leads yet</div> : (
                                <div className="lead-list">
                                    {leadItems.map((lead) => (
                                        <div className="lead-row" key={lead.id || lead.name}>
                                            <span className="lead-avatar">{lead.initials}</span>
                                            <span className="lead-details"><strong>{lead.name}</strong><small>{lead.company}</small></span>
                                            <span className={`status-pill status-${lead.status.toLowerCase()}`}>{lead.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="panel tasks-panel">
                            <div className="panel-heading"><div><span className="eyebrow">UP NEXT</span><h2>Tasks</h2></div><button className="text-button" onClick={() => setActiveView("Tasks")}>View all</button></div>
                            {taskItems.length === 0 ? <div className="empty-column">No tasks yet</div> : (
                                <div className="task-list">
                                    {taskItems.map((task) => (
                                        <div className="task-row" key={task.id || task.title}>
                                            <span className={`task-check priority-${task.priority.toLowerCase()}`}></span>
                                            <span><strong>{task.title}</strong><small>{task.meta}</small></span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                    <section className="assistant-grid"><div className="form-panel"><LogForm /></div><div className="chat-panel"><ChatBox /></div></section>
                </>}
                {activeView === "Leads" && (
                    <section className="panel page-panel">
                        <div className="panel-heading">
                            <div><span className="eyebrow">SALES PIPELINE</span><h2>All leads</h2></div>
                            <button className="primary-button" onClick={() => setShowLeadForm((visible) => !visible)}>
                                {showLeadForm ? "Close" : "+ Add lead"}
                            </button>
                        </div>

                        {showLeadForm && (
                            <form onSubmit={addLead} style={{ display: "grid", gap: "12px", marginBottom: "24px", maxWidth: "640px" }}>
                                <input
                                    aria-label="Lead name"
                                    placeholder="Lead name"
                                    value={leadName}
                                    onChange={(event) => setLeadName(event.target.value)}
                                    autoFocus
                                />
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <input
                                        aria-label="Company"
                                        placeholder="Company"
                                        value={leadCompany}
                                        onChange={(event) => setLeadCompany(event.target.value)}
                                    />
                                    <select
                                        aria-label="Lead status"
                                        value={leadStatus}
                                        onChange={(event) => setLeadStatus(event.target.value)}
                                    >
                                        <option>New</option>
                                        <option>Contacted</option>
                                        <option>Qualified</option>
                                        <option>Won</option>
                                        <option>Lost</option>
                                    </select>
                                    <button className="primary-button" type="submit">Save lead</button>
                                </div>
                            </form>
                        )}

                        <div className="kanban">
                            {["New", "Contacted", "Qualified", "Won", "Lost"].map((status) => {
                                const statusLeads = leadItems.filter((lead) => lead.status === status);
                                return (
                                    <div className="kanban-column" key={status}>
                                        <div className="kanban-heading"><strong>{status}</strong><span>{statusLeads.length}</span></div>
                                        {statusLeads.length === 0 ? (
                                            <div className="empty-column">No leads here</div>
                                        ) : (
                                            statusLeads.map((lead) => (
                                                <div className="lead-card" key={lead.id || lead.name}>
                                                    <span className="lead-avatar">{lead.initials}</span>
                                                    <strong>{lead.name}</strong>
                                                    <small>{lead.company}</small>
                                                    <button type="button" className="text-button" onClick={() => removeLead(lead.id)}>Remove</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
                {activeView === "Tasks" && (
                    <section className="panel page-panel">
                        <div className="panel-heading">
                            <div><span className="eyebrow">FOLLOW-UP QUEUE</span><h2>Tasks</h2></div>
                            <button className="primary-button" onClick={() => setShowTaskForm((visible) => !visible)}>
                                {showTaskForm ? "Close" : "+ Add task"}
                            </button>
                        </div>

                        {showTaskForm && (
                            <form onSubmit={addTask} style={{ display: "grid", gap: "12px", marginBottom: "24px", maxWidth: "560px" }}>
                                <input
                                    aria-label="Task title"
                                    placeholder="Task title"
                                    value={taskTitle}
                                    onChange={(event) => setTaskTitle(event.target.value)}
                                    autoFocus
                                />
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <input
                                        aria-label="Due date"
                                        type="date"
                                        value={taskDate}
                                        onChange={(event) => setTaskDate(event.target.value)}
                                    />
                                    <select
                                        aria-label="Priority"
                                        value={taskPriority}
                                        onChange={(event) => setTaskPriority(event.target.value)}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                    <button className="primary-button" type="submit">Save task</button>
                                </div>
                            </form>
                        )}

                        {taskItems.length === 0 ? (
                            <div className="empty-column">No tasks yet</div>
                        ) : (
                            <div className="full-task-list">
                                {taskItems.map((task) => (
                                    <div className="full-task-row" key={task.id || task.title}>
                                        <span className={`task-check priority-${task.priority.toLowerCase()}`}></span>
                                        <div><strong>{task.title}</strong><small>{task.meta}</small></div>
                                        <span className={`status-pill status-${task.priority.toLowerCase()}`}>{task.priority}</span>
                                        <button type="button" className="text-button" onClick={() => removeTask(task.id)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
                {activeView === "Analytics" && (
                    <section className="panel page-panel analytics-page">
                        <div className="panel-heading">
                            <div><span className="eyebrow">PERFORMANCE</span><h2>Pipeline momentum</h2></div>
                            <button className="primary-button" onClick={() => { setActiveView("Leads"); setShowLeadForm(true); }}>+ Add lead</button>
                        </div>

                        <div className="metric-grid" aria-label="Analytics summary">
                            <div className="metric-card"><span>Total leads</span><strong>{totalLeads}</strong></div>
                            <div className="metric-card"><span>Won leads</span><strong>{wonLeads}</strong></div>
                            <div className="metric-card"><span>Conversion rate</span><strong>{conversionRate}%</strong></div>
                            <div className="metric-card"><span>Open tasks</span><strong>{taskItems.length}</strong></div>
                        </div>

                        <div className="chart-bars" aria-label="Lead pipeline by status">
                            {pipelineCounts.map(({ status, count }) => (
                                <div className="bar-wrap" key={status}>
                                    <strong>{count}</strong>
                                    <div className="bar" style={{ height: `${Math.max((count / maxPipelineCount) * 100, count ? 8 : 2)}%` }}></div>
                                    <small>{status}</small>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

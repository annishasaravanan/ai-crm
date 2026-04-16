import LogForm from "./LogForm";
import ChatBox from "./ChatBox";

export default function Layout() {
    return (
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <h1 className="title-header">Log HCP Interaction</h1>
            <div className="container">
                <div className="left-panel">
                    <LogForm />
                </div>
                <div className="right-panel">
                    <ChatBox />
                </div>
            </div>
        </div>
    );
}
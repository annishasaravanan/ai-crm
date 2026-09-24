
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    hcp_name TEXT,
    date TEXT,
    time TEXT,
    interaction_type TEXT,
    attendees TEXT,
    topics TEXT,
    sentiment TEXT,
    follow_up TEXT
);
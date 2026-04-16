from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True)
    hcp_name = Column(String)
    date = Column(String)
    time = Column(String)
    interaction_type = Column(String)
    attendees = Column(String)
    topics = Column(String)
    sentiment = Column(String)
    follow_up = Column(String)
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class URLCheck(Base):
    __tablename__ = "url_checks"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    status = Column(String)
    response_time = Column(Float)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

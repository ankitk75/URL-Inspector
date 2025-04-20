from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from app import models, crud, db

app = FastAPI(title="URL Inspector API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLCheckRequest(BaseModel):
    urls: List[str]

@app.on_event("startup")
def startup_event():
    db.init_db()

@app.post("/check_urls")
def check_urls(request: URLCheckRequest):
    return {"results": crud.check_urls(request.urls)}

@app.get("/url_history")
def url_history(url: str):
    return {"history": crud.get_url_history(url)}

@app.get("/analytics")
def analytics(urls: str = Query(...)):
    url_list = urls.split(",")
    return {"analytics": crud.get_analytics(url_list)}

@app.get("/latest_statuses")
def latest_statuses():
    return {"results": crud.get_latest_statuses()}

@app.delete("/delete_all_urls")
def delete_all_urls():
    from app.db import SessionLocal
    db = SessionLocal()
    db.query(models.URLCheck).delete()
    db.commit()
    db.close()
    return {"success": True}

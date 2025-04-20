import httpx
import datetime
import asyncio
from app.db import SessionLocal
from app.models import URLCheck
from sqlalchemy import func

TIMEOUT = 5

# Check a single URL
async def check_url(url):
    try:
        start = datetime.datetime.utcnow()
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(url)
        elapsed = (datetime.datetime.utcnow() - start).total_seconds() * 1000
        status = "UP" if resp.status_code < 400 else "DOWN"
        return status, elapsed
    except Exception:
        return "DOWN", None

def check_urls(urls):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    results = loop.run_until_complete(_check_urls(urls))
    loop.close()
    # Save to DB
    db = SessionLocal()
    for r in results:
        db.add(URLCheck(url=r["url"], status=r["status"], response_time=r["response_time"], checked_at=datetime.datetime.utcnow()))
    db.commit()
    db.close()
    return results

async def _check_urls(urls):
    tasks = [check_url(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return [
        {"url": url, "status": status, "response_time": resp_time, "last_checked": datetime.datetime.utcnow().isoformat()}
        for url, (status, resp_time) in zip(urls, results)
    ]

def get_url_history(url):
    db = SessionLocal()
    q = db.query(URLCheck).filter(URLCheck.url == url).order_by(URLCheck.checked_at.desc()).limit(100)
    history = [
        {
            "url": row.url,
            "status": row.status,
            "response_time": row.response_time,
            "checked_at": row.checked_at.isoformat(),
        }
        for row in q
    ]
    db.close()
    return history

def get_analytics(urls):
    db = SessionLocal()
    result = []
    for url in urls:
        checks = db.query(URLCheck).filter(URLCheck.url == url).order_by(URLCheck.checked_at.desc()).limit(100).all()
        if not checks:
            result.append({"url": url, "uptime_percent": 0, "avg_response": None})
            continue
        up_count = sum(1 for c in checks if c.status == "UP")
        uptime = up_count / len(checks) * 100
        avg_resp = sum(c.response_time for c in checks if c.response_time) / max(1, sum(1 for c in checks if c.response_time))
        result.append({"url": url, "uptime_percent": uptime, "avg_response": avg_resp})
    db.close()
    return result

def get_latest_statuses():
    db = SessionLocal()
    subq = (
        db.query(
            URLCheck.url,
            func.max(URLCheck.checked_at).label("max_checked_at")
        )
        .group_by(URLCheck.url)
        .subquery()
    )
    q = (
        db.query(URLCheck)
        .join(subq, (URLCheck.url == subq.c.url) & (URLCheck.checked_at == subq.c.max_checked_at))
        .order_by(URLCheck.url)
        .all()
    )
    results = [
        {
            "url": row.url,
            "status": row.status,
            "response_time": row.response_time,
            "last_checked": row.checked_at.isoformat(),
        }
        for row in q
    ]
    db.close()
    return results

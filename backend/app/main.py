from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from app.database import engine, Base, get_db, SessionLocal
from app.models import User
from app.dependencies import decode_token
from app.routers import (
    auth, users, students, parents, teachers, admin,
    grades, schedule, attendance, assignments,
    announcements, chat, notifications, analytics, reports
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Электронный дневник ИМСИТ", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(students.router)
app.include_router(parents.router)
app.include_router(teachers.router)
app.include_router(admin.router)
app.include_router(grades.router)
app.include_router(schedule.router)
app.include_router(attendance.router)
app.include_router(assignments.router)
app.include_router(announcements.router)
app.include_router(chat.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(reports.router)


ws_chat_connections: dict[int, WebSocket] = {}
ws_notification_connections: dict[int, WebSocket] = {}


def _auth_ws(token: str, db: Session) -> User:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


@app.websocket("/ws/chat")
async def ws_chat(websocket: WebSocket, token: str = ""):
    db = SessionLocal()
    try:
        user = _auth_ws(token, db)
        if not user:
            await websocket.close(code=4001)
            return
        await websocket.accept()
        ws_chat_connections[user.id] = websocket
        chat.active_connections[user.id] = websocket
        try:
            while True:
                data = await websocket.receive_text()
                msg_data = json.loads(data)
                receiver_id = msg_data.get("receiver_id")
                if receiver_id and receiver_id in ws_chat_connections:
                    await ws_chat_connections[receiver_id].send_json({
                        "type": "new_message",
                        "message": {
                            "sender_id": user.id,
                            "sender_name": f"{user.last_name} {user.first_name}",
                            "content": msg_data.get("content", ""),
                        }
                    })
        except WebSocketDisconnect:
            pass
        finally:
            ws_chat_connections.pop(user.id, None)
            chat.active_connections.pop(user.id, None)
    finally:
        db.close()


@app.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket, token: str = ""):
    db = SessionLocal()
    try:
        user = _auth_ws(token, db)
        if not user:
            await websocket.close(code=4001)
            return
        await websocket.accept()
        ws_notification_connections[user.id] = websocket
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            pass
        finally:
            ws_notification_connections.pop(user.id, None)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Электронный дневник ИМСИТ API", "docs": "/docs"}

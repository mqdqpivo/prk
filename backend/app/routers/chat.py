import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func

from app.database import get_db, SessionLocal
from app.models import User, ChatMessage
from app.schemas import ChatMessageCreate, ChatMessageOut, ConversationOut, UserOut
from app.dependencies import get_current_user, decode_token

router = APIRouter(prefix="/api/chat", tags=["chat"])

active_connections: dict[int, WebSocket] = {}


@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subq = db.query(
        func.greatest(ChatMessage.sender_id, ChatMessage.receiver_id).label("u1"),
        func.least(ChatMessage.sender_id, ChatMessage.receiver_id).label("u2"),
        func.max(ChatMessage.id).label("max_id")
    ).filter(
        or_(
            ChatMessage.sender_id == current_user.id,
            ChatMessage.receiver_id == current_user.id
        )
    ).group_by("u1", "u2").subquery()

    last_msgs = db.query(ChatMessage).filter(
        ChatMessage.id.in_(db.query(subq.c.max_id))
    ).all()

    conversations = []
    for msg in last_msgs:
        other_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        other_user = db.query(User).filter(User.id == other_id).first()
        if not other_user:
            continue
        unread = db.query(ChatMessage).filter(
            ChatMessage.sender_id == other_id,
            ChatMessage.receiver_id == current_user.id,
            ChatMessage.is_read == False
        ).count()
        conversations.append({
            "user": UserOut.model_validate(other_user).model_dump(),
            "last_message": ChatMessageOut.model_validate(msg).model_dump(),
            "unread_count": unread,
        })

    conversations.sort(key=lambda x: x["last_message"]["sent_at"] or "", reverse=True)
    return conversations


@router.get("/messages/{user_id}", response_model=list[ChatMessageOut])
def get_messages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatMessage).options(
        joinedload(ChatMessage.sender),
        joinedload(ChatMessage.receiver)
    ).filter(
        or_(
            and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == user_id),
            and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == current_user.id),
        )
    ).order_by(ChatMessage.sent_at.asc()).all()

    db.query(ChatMessage).filter(
        ChatMessage.sender_id == user_id,
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

    return messages


@router.post("/messages", response_model=ChatMessageOut)
async def send_message(
    data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = ChatMessage(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    if data.receiver_id in active_connections:
        ws = active_connections[data.receiver_id]
        try:
            await ws.send_json({
                "type": "new_message",
                "message": {
                    "id": msg.id,
                    "sender_id": current_user.id,
                    "sender_name": f"{current_user.last_name} {current_user.first_name}",
                    "content": msg.content,
                    "sent_at": msg.sent_at.isoformat() if msg.sent_at else None,
                }
            })
        except Exception:
            pass

    return db.query(ChatMessage).options(
        joinedload(ChatMessage.sender),
        joinedload(ChatMessage.receiver)
    ).filter(ChatMessage.id == msg.id).first()


@router.put("/messages/{message_id}/read")
def mark_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.receiver_id == current_user.id
    ).first()
    if msg:
        msg.is_read = True
        db.commit()
    return {"ok": True}

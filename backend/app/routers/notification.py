from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import manager


router = APIRouter(
    tags=["Notifications"]
)


@router.websocket("/ws/notifications")
async def notifications_websocket(
    websocket: WebSocket,
):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)

    except Exception:
        manager.disconnect(websocket)
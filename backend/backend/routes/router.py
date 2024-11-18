from fastapi import APIRouter
# from .chat import chat_router
from .home import home_router


router = APIRouter()

router.include_router(home_router)
# router.include_router(chat_router)
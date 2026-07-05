from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.info import InfoPage
from app.schemas.info import InfoRead, VisitingRulesRead

router = APIRouter()


@router.get("", response_model=list[InfoRead])
def list_info(db: Session = Depends(get_db)) -> list[InfoRead]:
    return db.query(InfoPage).all()


@router.get("/visiting-rules", response_model=VisitingRulesRead)
def get_visiting_rules(db: Session = Depends(get_db)) -> VisitingRulesRead:
    info_page = db.query(InfoPage).filter(InfoPage.title == "Правила посещения").first()
    if not info_page:
        info_page = InfoPage(
            title="Правила посещения",
            content="Приходите за 10 минут до начала тренировки. Соблюдайте правила безопасности и берите с собой удобную одежду.",
        )
        db.add(info_page)
        db.commit()
        db.refresh(info_page)

    content = info_page.content or ""
    lines = [line.strip() for line in content.split("\n") if line.strip()]
    return VisitingRulesRead(
        title=info_page.title,
        address="ул. Лесная, 10",
        schedule="Пн-Вс: 10:00–22:00",
        what_to_bring=["спортивная одежда", "обувь с нескользящей подошвой"],
        safety_rules=lines or ["Соблюдайте правила безопасности"],
    )

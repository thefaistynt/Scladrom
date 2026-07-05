from pydantic import BaseModel


class InfoRead(BaseModel):
    id: int
    title: str
    content: str

    class Config:
        from_attributes = True


class VisitingRulesRead(BaseModel):
    title: str
    address: str
    schedule: str
    what_to_bring: list[str]
    safety_rules: list[str]

    class Config:
        from_attributes = True

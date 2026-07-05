from pydantic import BaseModel


class NotificationSettingsRead(BaseModel):
    enabled: bool
    reminderMinutesBefore: int
    cancellationNotifications: bool

    class Config:
        from_attributes = True


class NotificationSettingsWrite(BaseModel):
    enabled: bool
    reminderMinutesBefore: int
    cancellationNotifications: bool

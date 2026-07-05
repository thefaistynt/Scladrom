# Карта навигации приложения «Вертикаль»

Данная карта описывает переходы между экранами приложения на основе проектной документации.

## Схема переходов

```mermaid
graph TD
    SCR01[SCR-01 Регистрация]
    SCR02[SCR-02 Вход]
    SCR03[SCR-03 Оферта]
    SCR04[SCR-04 Расписание]
    SCR05[SCR-05 Бронирование]
    SCR06[SCR-06 Мои бронирования]
    SCR07[SCR-07 Детали бронирования]
    SCR08[SCR-08 Инфо-центр]
    SCR09[SCR-09 Настройки уведомлений]
    SCR10[SCR-10 Рейтинг инструктора]

    SCR01 -- "Уже есть аккаунт?" --> SCR02
    SCR02 -- "Нет аккаунта?" --> SCR01
    SCR02 -- "Успешный вход" --> SCR04

    SCR04 -- "Клик по слоту" --> SCR05
    SCR05 -- "Первая запись" --> SCR03
    SCR03 -- "Принятие условий" --> SCR05
    SCR05 -- "Подтверждение" --> SCR06

    SCR04 -- "Навигация" --> SCR06
    SCR04 -- "Навигация" --> SCR08
    SCR06 -- "Клик по бронированию" --> SCR07
    SCR07 -- "Возврат" --> SCR06

    SCR04 -- "Доступ из профиля/настроек" --> SCR09
    SCR07 -- "После завершения тренировки" --> SCR10
```

### Описание переходов
1. **Авторизация и Регистрация**
    - [`SCR-01-registration.md`](3-design-brief/SCR-01-registration.md) $\rightarrow$ [`SCR-02-login.md`](3-design-brief/SCR-02-login.md) (Ссылка «Уже есть аккаунт? Войти»)
    - [`SCR-02-login.md`](3-design-brief/SCR-02-login.md) $\rightarrow$ [`SCR-01-registration.md`](3-design-brief/SCR-01-registration.md) (Ссылка «Нет аккаунта? Зарегистрироваться»)
    - [`SCR-02-login.md`](3-design-brief/SCR-02-login.md) $\rightarrow$ [`SCR-04-schedule.md`](3-design-brief/SCR-04-schedule.md) (После успешного входа)

2. **Основной пользовательский путь (Бронирование)**
    - [`SCR-04-schedule.md`](3-design-brief/SCR-04-schedule.md) $\rightarrow$ [`SCR-05-booking.md`](3-design-brief/SCR-05-booking.md) (Клик по карточке слота)
    - [`SCR-05-booking.md`](3-design-brief/SCR-05-booking.md) $\rightarrow$ [`SCR-03-offer.md`](3-design-brief/SCR-03-offer.md) (Если первая запись $\rightarrow$ Принятие оферты)
    - [`SCR-03-offer.md`](3-design-brief/SCR-03-offer.md) $\rightarrow$ [`SCR-05-booking.md`](3-design-brief/SCR-05-booking.md) (После принятия условий $\rightarrow$ Возврат к подтверждению)
    - [`SCR-05-booking.md`](3-design-brief/SCR-05-booking.md) $\rightarrow$ [`SCR-06-my-bookings.md`](3-design-brief/SCR-06-my-bookings.md) (После успешного подтверждения записи)

3. **Управление записями и Информация**
    - [`SCR-04-schedule.md`](3-design-brief/SCR-04-schedule.md) $\rightarrow$ [`SCR-06-my-bookings.md`](3-design-brief/SCR-06-my-bookings.md) (Навигация в «Мои бронирования»)
    - [`SCR-04-schedule.md`](3-design-brief/SCR-04-schedule.md) $\rightarrow$ [`SCR-08-info-center.md`](3-design-brief/SCR-08-info-center.md) (Навигация в «Инфо-центр»)
    - [`SCR-06-my-bookings.md`](3-design-brief/SCR-06-my-bookings.md) $\rightarrow$ [`SCR-07-booking-details.md`](3-design-brief/SCR-07-booking-details.md) (Клик по карточке бронирования)
    - [`SCR-07-booking-details.md`](3-design-brief/SCR-07-booking-details.md) $\rightarrow$ [`SCR-06-my-bookings.md`](3-design-brief/SCR-06-my-bookings.md) (Возврат к списку)

4. **Дополнительные экраны**
    - [`SCR-04-schedule.md`](3-design-brief/SCR-04-schedule.md) $\rightarrow$ [`SCR-09-notification-settings.md`](3-design-brief/SCR-09-notification-settings.md) (Навигация в «Профиль/Настройки»)
    - [`SCR-07-booking-details.md`](3-design-brief/SCR-07-booking-details.md) $\rightarrow$ [`SCR-10-instructor-rating.md`](3-design-brief/SCR-10-instructor-rating.md) (Доступен после завершения тренировки)

---

## Легенда
- $\rightarrow$ : Направление перехода
- `SCR-XX` : Идентификатор экрана
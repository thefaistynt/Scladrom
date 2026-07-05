# ER-модель и модели сущностей системы «Вертикаль»

## 1. ER-модель (Entity-Relationship)

Модель описывает структуру данных для управления бронированием тренировок на скалодроме.

### Диаграмма связей (Mermaid)

```mermaid
erDiagram
    CLIENT ||--o{ BOOKING : creates
    TRAINING_SLOT ||--o{ BOOKING : has
    INSTRUCTOR ||--o{ TRAINING_SLOT : leads
    TRAINING_FORMAT ||--o{ TRAINING_SLOT : defines
    ZONE ||--o{ TRAINING_SLOT : hosts
    BOOKING ||--o| EQUIPMENT_RENTAL : may_include
    BOOKING ||--o| INSTRUCTOR_RATING : may_have

    CLIENT {
        string id PK
        string email
        string password_hash
        datetime registeredAt
    }

    TRAINING_SLOT {
        string id PK
        datetime startTime
        int durationMinutes
        int capacity
        int freeSeats
        string status
        string instructorId FK
        string formatId FK
        string zoneId FK
    }

    BOOKING {
        string id PK
        string clientId FK
        string slotId FK
        int seatsCount
        string status
        datetime createdAt
        datetime cancelledAt
        string cancellationReason
    }

    EQUIPMENT_RENTAL {
        string id PK
        string bookingId FK
        bool useRental
        decimal rentalPrice
    }

    INSTRUCTOR {
        string id PK
        string name
        string specialization
    }

    TRAINING_FORMAT {
        string id PK
        string name
        string level "Beginner / Advanced"
    }

    ZONE {
        string id PK
        string name
        int maxCapacity
    }

    INSTRUCTOR_RATING {
        string id PK
        string bookingId FK
        int score
        string reviewText
        datetime createdAt
    }
```

---

## 2. Описание моделей сущностей и права доступа

В данной таблице указано, какие сущности приложение только читает (Read-only), а какие может изменять/создавать (Read-Write).

| Сущность | Тип доступа | Описание | Поля |
| :--- | :--- | :--- | :--- |
| **Client** | **Read-Write** | Профиль пользователя. Создается при регистрации, читается при авторизации. | `id`, `email`, `password_hash` |
| **TrainingSlot** | **Read-only** | Расписание. Формируется администратором в бэкенде. Приложение только отображает список и фильтрует. | `id`, `startTime`, `durationMinutes`, `capacity`, `freeSeats`, `status`, `instructorId`, `formatId`, `zoneId` |
| **Booking** | **Read-Write** | Запись на тренировку. Создается клиентом, читается в «Моих записях», обновляется при отмене. | `id`, `clientId`, `slotId`, `seatsCount`, `status`, `createdAt`, `cancelledAt`, `cancellationReason` |
| **EquipmentRental** | **Read-Write** | Информация о прокате. Создается вместе с бронированием. | `id`, `bookingId`, `useRental`, `rentalPrice` |
| **Instructor** | **Read-only** | Данные об инструкторе. Приходят из бэкенда для отображения в слоте. | `id`, `name`, `specialization` |
| **TrainingFormat** | **Read-only** | Типы тренировок (Болдеринг/Трассы). Справочник из бэкенда. | `id`, `name`, `level` |
| **Zone** | **Read-only** | Зоны скалодрома. Справочник из бэкенда. | `id`, `name`, `maxCapacity` |
| **InstructorRating** | **Read-Write** | Оценка инструктора. Создается клиентом после тренировки. | `id`, `bookingId`, `score`, `reviewText`, `createdAt` |

---

## 3. Sequence-диаграмма: createBooking

Сценарий создания бронирования с обработкой различных ответов бэкенда.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Клиент
    participant App as Mobile App
    participant API as Backend API
    participant DB as Database

    Client->>App: Выбирает слот, кол-во мест и прокат
    App->>App: Валидация уровня (Новичок $\neq$ Опытный)
    
    App->>API: POST /bookings (slotId, seatsCount, rentalOption)
    
    API->>DB: Атомарная проверка свободных мест
    DB-->>API: Результат проверки

    alt 201 Created (Успех)
        API->>DB: Создание Booking + EquipmentRental
        DB-->>API: OK
        API-->>App: 201 Created (Booking Details)
        App-->>Client: Показ экрана «Запись подтверждена»
    else 409 Conflict (Места заняты)
        API-->>App: 409 Conflict ("Место уже занято")
        App-->>Client: Показ ошибки «Место уже занято»
    else 410 Gone (Слот отменен/недоступен)
        API-->>App: 410 Gone ("Слот больше не доступен")
        App-->>Client: Показ ошибки «Слот недоступен, обновите расписание»
    end
```

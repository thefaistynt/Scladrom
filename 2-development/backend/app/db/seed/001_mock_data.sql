-- Mock data for Vertical Climbing MVP
-- Compatible with the current backend schema.

INSERT INTO clients (id, email, full_name, password_hash, birth_date, accepted_terms, is_active, experience_level) VALUES
(1, 'alex@example.com', 'Алексей Иванов', 'hashed_password_1', '2000-05-12', TRUE, TRUE, 'experienced'),
(2, 'maria@example.com', 'Мария Смирнова', 'hashed_password_2', '1998-11-03', TRUE, TRUE, 'beginner'),
(3, 'daniel@example.com', 'Даниил Козлов', 'hashed_password_3', '1995-06-20', TRUE, TRUE, 'experienced');

INSERT INTO instructors (id, full_name, specialization, is_active) VALUES
(1, 'Илья Петров', 'Болдеринг для новичков', TRUE),
(2, 'Ольга Кузнецова', 'Трассы с верёвкой', TRUE),
(3, 'Максим Сорокин', 'Общая техника и безопасность', TRUE);

INSERT INTO training_formats (id, name, level, description) VALUES
(1, 'Болдеринг с инструктажем', 'Beginner', 'Подходит новичкам'),
(2, 'Трассы с верёвкой', 'Advanced', 'Для опытных клиентов');

INSERT INTO zones (id, name, max_capacity) VALUES
(1, 'Новичковая зона', 8),
(2, 'Основная зона', 16);

INSERT INTO slots (id, start_time, end_time, capacity, available_spots, instructor_name, format_name, zone_name, price, status) VALUES
(1, '2026-07-06 18:00:00', '2026-07-06 19:30:00', 8, 3, 'Илья Петров', 'Болдеринг с инструктажем', 'Новичковая зона', 1500, 'scheduled'),
(2, '2026-07-06 20:00:00', '2026-07-06 21:30:00', 16, 10, 'Ольга Кузнецова', 'Трассы с верёвкой', 'Основная зона', 2200, 'scheduled'),
(3, '2026-07-07 19:00:00', '2026-07-07 20:30:00', 8, 8, 'Максим Сорокин', 'Болдеринг с инструктажем', 'Новичковая зона', 1800, 'scheduled');

INSERT INTO bookings (id, client_id, slot_id, status, booked_at, rental_option, training_amount, rental_amount, total_amount) VALUES
(1, 1, 1, 'confirmed', '2026-07-01 10:00:00', 'full', 1500, 1000, 2500),
(2, 2, 2, 'confirmed', '2026-07-02 09:30:00', 'none', 2200, 0, 2200),
(3, 3, 3, 'cancelled_by_gym', '2026-07-03 11:10:00', 'full', 1800, 1000, 2800);

INSERT INTO equipment_rentals (id, booking_id, use_rental, rental_price) VALUES
(1, 1, TRUE, 1000.00),
(2, 2, FALSE, 0.00),
(3, 3, TRUE, 1000.00);

INSERT INTO instructor_ratings (id, booking_id, score, review_text) VALUES
(1, 1, 5, 'Очень понятно и безопасно'),
(2, 2, 4, 'Хорошая тренировка, но хотелось чуть больше детализации');

-- Hostel Management System - Schema (Flyway V1)

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role     VARCHAR(20)  NOT NULL DEFAULT 'ADMIN',
    enabled  BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      VARCHAR(20)  NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(15)  NOT NULL,
    course          VARCHAR(80)  NOT NULL,
    year_of_study   INT          NOT NULL,
    guardian_name   VARCHAR(100) NOT NULL,
    guardian_contact VARCHAR(15) NOT NULL,
    address         VARCHAR(500),
    admission_date  DATE         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_students_name (full_name),
    INDEX idx_students_status (status)
);

CREATE TABLE IF NOT EXISTS rooms (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number  VARCHAR(10)  NOT NULL UNIQUE,
    floor_no     INT          NOT NULL,
    room_type    VARCHAR(20)  NOT NULL,
    capacity     INT          NOT NULL,
    monthly_fee  DECIMAL(10,2) NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE',
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id     BIGINT      NOT NULL,
    room_id        BIGINT      NOT NULL,
    allotment_date DATE        NOT NULL,
    checkout_date  DATE        NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (room_id)    REFERENCES rooms (id),
    INDEX idx_allocations_status (status)
);

CREATE TABLE IF NOT EXISTS fees (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT         NOT NULL,
    amount     DECIMAL(12,2)  NOT NULL,
    due_date   DATE           NOT NULL,
    period     VARCHAR(50),
    created_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    INDEX idx_fees_due (due_date)
);

CREATE TABLE IF NOT EXISTS payments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    fee_id      BIGINT         NOT NULL,
    amount      DECIMAL(12,2)  NOT NULL,
    payment_date DATE          NOT NULL,
    method      VARCHAR(30)    NOT NULL,
    reference   VARCHAR(60)    UNIQUE,
    note        VARCHAR(300),
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_id) REFERENCES fees (id),
    INDEX idx_payments_date (payment_date)
);

CREATE TABLE IF NOT EXISTS complaints (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(20)   NOT NULL UNIQUE,
    student_id   BIGINT        NOT NULL,
    room_id      BIGINT        NULL,
    category     VARCHAR(40)   NOT NULL,
    description  VARCHAR(1000) NOT NULL,
    priority     VARCHAR(10)   NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    submitted_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (room_id)    REFERENCES rooms (id)
);

-- ====================================================================
-- VirtualNest HRMS — Supabase (PostgreSQL) Full Schema + Seed Data
-- Paste me into: Supabase → Project → SQL Editor → New query → Run
-- Idempotent: IF NOT EXISTS / ON CONFLICT / DROP IF EXISTS everywhere
-- ====================================================================
SET client_min_messages TO WARNING;

-- 1. Tables ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "User" (
    "id"           SERIAL NOT NULL,
    "username"     TEXT    NOT NULL,
    "email"        TEXT    NOT NULL,
    "passwordHash" TEXT    NOT NULL,
    "role"         TEXT    NOT NULL DEFAULT 'employee',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id"        SERIAL  NOT NULL,
    "token"     TEXT    NOT NULL,
    "userId"    INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Employee" (
    "id"               SERIAL         NOT NULL,
    "empId"            TEXT           NOT NULL,
    "firstName"        TEXT           NOT NULL,
    "lastName"         TEXT           NOT NULL,
    "email"            TEXT           NOT NULL,
    "phone"            TEXT,
    "department"       TEXT           NOT NULL,
    "designation"      TEXT           NOT NULL,
    "joinDate"         TIMESTAMP(3)   NOT NULL,
    "salary"           DOUBLE PRECISION NOT NULL,
    "status"           TEXT           NOT NULL DEFAULT 'active',
    "photo"            TEXT,
    "reportingManager" TEXT,
    "address"          TEXT,
    "emergencyContact" TEXT,
    "bankDetails"      TEXT,
    "dateOfBirth"      DATE,
    "personalEmail"    TEXT,
    "altPhone"         TEXT,
    "permanentAddress" TEXT,
    "points"           INTEGER        NOT NULL DEFAULT 0,
    "createdAt"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payroll" (
    "id"          SERIAL  NOT NULL,
    "employeeId"  INTEGER NOT NULL,
    "month"       INTEGER NOT NULL,
    "year"        INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "hra"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allowances"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary"   DOUBLE PRECISION NOT NULL,
    "status"      TEXT    NOT NULL DEFAULT 'pending',
    "paidAt"      TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Leave" (
    "id"         SERIAL  NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "leaveType"  TEXT    NOT NULL,
    "fromDate"   TIMESTAMP(3) NOT NULL,
    "toDate"     TIMESTAMP(3) NOT NULL,
    "reason"     TEXT,
    "status"     TEXT    NOT NULL DEFAULT 'pending',
    "appliedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Attendance" (
    "id"         SERIAL  NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date"       TIMESTAMP(3) NOT NULL,
    "checkIn"    TIMESTAMP(3),
    "checkOut"   TIMESTAMP(3),
    "status"     TEXT    NOT NULL DEFAULT 'present',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Task" (
    "id"          SERIAL  NOT NULL,
    "title"       TEXT    NOT NULL,
    "description" TEXT,
    "status"      TEXT    NOT NULL DEFAULT 'pending',
    "priority"    TEXT    NOT NULL DEFAULT 'medium',
    "assignedTo"  INTEGER,
    "assignedBy"  INTEGER,
    "dueDate"     TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Announcement" (
    "id"        SERIAL  NOT NULL,
    "title"     TEXT    NOT NULL,
    "content"   TEXT    NOT NULL,
    "priority"  TEXT    NOT NULL DEFAULT 'normal',
    "isPinned"  BOOLEAN NOT NULL DEFAULT FALSE,
    "photo"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Setting" (
    "id"    SERIAL NOT NULL,
    "key"   TEXT   NOT NULL,
    "value" TEXT,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobOpening" (
    "id"           SERIAL  NOT NULL,
    "title"        TEXT    NOT NULL,
    "department"   TEXT    NOT NULL,
    "description"  TEXT    NOT NULL,
    "requirements" TEXT    NOT NULL,
    "status"       TEXT    NOT NULL DEFAULT 'open',
    "postedBy"     INTEGER,
    "postedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Candidate" (
    "id"        SERIAL  NOT NULL,
    "jobId"     INTEGER NOT NULL,
    "firstName" TEXT    NOT NULL,
    "lastName"  TEXT    NOT NULL,
    "email"     TEXT    NOT NULL,
    "phone"     TEXT,
    "resumeUrl" TEXT,
    "status"    TEXT    NOT NULL DEFAULT 'applied',
    "notes"     TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PerformanceReview" (
    "id"         SERIAL  NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "period"     TEXT    NOT NULL,
    "goals"      TEXT    NOT NULL,
    "kpis"       TEXT    NOT NULL,
    "rating"     INTEGER NOT NULL,
    "comments"   TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TrainingProgram" (
    "id"          SERIAL NOT NULL,
    "title"       TEXT   NOT NULL,
    "description" TEXT   NOT NULL,
    "duration"    TEXT   NOT NULL,
    "instructor"  TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Asset" (
    "id"         SERIAL  NOT NULL,
    "employeeId" INTEGER,
    "name"       TEXT    NOT NULL,
    "type"       TEXT    NOT NULL,
    "serialNo"   TEXT    NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "status"     TEXT    NOT NULL DEFAULT 'available',
    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ExpenseClaim" (
    "id"         SERIAL             NOT NULL,
    "employeeId" INTEGER            NOT NULL,
    "title"      TEXT               NOT NULL,
    "amount"     DOUBLE PRECISION   NOT NULL,
    "category"   TEXT               NOT NULL,
    "receiptUrl" TEXT,
    "status"     TEXT               NOT NULL DEFAULT 'pending',
    "createdAt"  TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpenseClaim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Document" (
    "id"                 SERIAL  NOT NULL,
    "employeeId"         INTEGER NOT NULL,
    "title"              TEXT    NOT NULL,
    "type"               TEXT    NOT NULL,
    "fileUrl"            TEXT    NOT NULL,
    "verificationStatus" TEXT    NOT NULL DEFAULT 'pending',
    "rejectionReason"    TEXT,
    "uploadedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ExitRecord" (
    "id"              SERIAL  NOT NULL,
    "employeeId"      INTEGER NOT NULL,
    "resignationDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDay"  TIMESTAMP(3) NOT NULL,
    "reason"          TEXT    NOT NULL,
    "interviewNotes"  TEXT,
    "fnfStatus"       TEXT    NOT NULL DEFAULT 'pending',
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExitRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id"        SERIAL  NOT NULL,
    "userId"    INTEGER NOT NULL,
    "title"     TEXT    NOT NULL,
    "message"   TEXT    NOT NULL,
    "type"      TEXT    NOT NULL DEFAULT 'info',
    "read"      BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QueryBox" (
    "id"          SERIAL  NOT NULL,
    "name"        TEXT,
    "contact"     TEXT,
    "message"     TEXT    NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT TRUE,
    "status"      TEXT    NOT NULL DEFAULT 'pending',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QueryBox_pkey" PRIMARY KEY ("id")
);

-- 2. Unique Indexes --------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key"           ON "User"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"              ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key"      ON "RefreshToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_empId_key"          ON "Employee"("empId");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key"          ON "Employee"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key"             ON "Setting"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "Asset_serialNo_key"          ON "Asset"("serialNo");
CREATE UNIQUE INDEX IF NOT EXISTS "ExitRecord_employeeId_key"   ON "ExitRecord"("employeeId");

-- 3. Foreign Keys (drop+recreate to be safe) ------------------------------

ALTER TABLE "RefreshToken"   DROP CONSTRAINT IF EXISTS "RefreshToken_userId_fkey";
ALTER TABLE "RefreshToken"   ADD CONSTRAINT "RefreshToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payroll"        DROP CONSTRAINT IF EXISTS "Payroll_employeeId_fkey";
ALTER TABLE "Payroll"        ADD CONSTRAINT "Payroll_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Leave"          DROP CONSTRAINT IF EXISTS "Leave_employeeId_fkey";
ALTER TABLE "Leave"          ADD CONSTRAINT "Leave_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance"     DROP CONSTRAINT IF EXISTS "Attendance_employeeId_fkey";
ALTER TABLE "Attendance"     ADD CONSTRAINT "Attendance_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Task"           DROP CONSTRAINT IF EXISTS "Task_assignedTo_fkey";
ALTER TABLE "Task"           ADD CONSTRAINT "Task_assignedTo_fkey"
  FOREIGN KEY ("assignedTo") REFERENCES "Employee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task"           DROP CONSTRAINT IF EXISTS "Task_assignedBy_fkey";
ALTER TABLE "Task"           ADD CONSTRAINT "Task_assignedBy_fkey"
  FOREIGN KEY ("assignedBy") REFERENCES "Employee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Announcement"   DROP CONSTRAINT IF EXISTS "Announcement_createdBy_fkey";
ALTER TABLE "Announcement"   ADD CONSTRAINT "Announcement_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "Employee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "JobOpening"     DROP CONSTRAINT IF EXISTS "JobOpening_postedBy_fkey";
ALTER TABLE "JobOpening"     ADD CONSTRAINT "JobOpening_postedBy_fkey"
  FOREIGN KEY ("postedBy") REFERENCES "Employee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Candidate"      DROP CONSTRAINT IF EXISTS "Candidate_jobId_fkey";
ALTER TABLE "Candidate"      ADD CONSTRAINT "Candidate_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "JobOpening"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PerformanceReview" DROP CONSTRAINT IF EXISTS "PerformanceReview_employeeId_fkey";
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Asset"          DROP CONSTRAINT IF EXISTS "Asset_employeeId_fkey";
ALTER TABLE "Asset"          ADD CONSTRAINT "Asset_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExpenseClaim"   DROP CONSTRAINT IF EXISTS "ExpenseClaim_employeeId_fkey";
ALTER TABLE "ExpenseClaim"   ADD CONSTRAINT "ExpenseClaim_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Document"       DROP CONSTRAINT IF EXISTS "Document_employeeId_fkey";
ALTER TABLE "Document"       ADD CONSTRAINT "Document_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExitRecord"     DROP CONSTRAINT IF EXISTS "ExitRecord_employeeId_fkey";
ALTER TABLE "ExitRecord"     ADD CONSTRAINT "ExitRecord_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification"   DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE "Notification"   ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Seed Default Admin + HR ----------------------------------------------
-- (bcrypt hashes)
--   admin@virtualnest.com   password: admin@vn
--   HR@vn.com               password: hr@vn

INSERT INTO "User" ("username", "email", "passwordHash", "role")
VALUES
  ('admin',    'admin@virtualnest.com', '$2b$12$mrmtIBYT/Y8iSofaZ.tCR.WhqOE9RoyopKlduJ49YKOona3IzEabS', 'admin'),
  ('HR_Admin', 'HR@vn.com',             '$2b$10$podPkl3IQrGmhQ/3TPHPbu1.0RKluZkDzw.hhFh/kp53B4/KMzaDS', 'hr')
ON CONFLICT ("email") DO UPDATE SET
  "username"     = EXCLUDED."username",
  "passwordHash" = EXCLUDED."passwordHash",
  "role"         = EXCLUDED."role";

INSERT INTO "Employee"
  ("empId", "firstName", "lastName", "email", "department", "designation", "joinDate", "salary", "status")
VALUES
  ('EMP-ADMIN', 'System', 'Admin',  'admin@virtualnest.com', 'Administration',  'Administrator', NOW(), 0, 'active'),
  ('EMP-HR',    'HR',     'Manager','HR@vn.com',             'Human Resources', 'HR Manager',    NOW(), 0, 'active')
ON CONFLICT ("email") DO UPDATE SET
  "firstName"   = EXCLUDED."firstName",
  "lastName"    = EXCLUDED."lastName",
  "department"  = EXCLUDED."department",
  "designation" = EXCLUDED."designation",
  "status"      = EXCLUDED."status";

-- DONE

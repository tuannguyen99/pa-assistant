-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "roles" TEXT NOT NULL,
    "ldapDN" TEXT,
    "ldapSyncedAt" DATETIME,
    "authProvider" TEXT NOT NULL DEFAULT 'credentials',
    "managerId" TEXT,
    "grade" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employeeId" TEXT,
    "jobTitle" TEXT,
    "employmentStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TargetSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "targets" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    "submittedToHRAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TargetSetting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TargetSetting_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "revieweeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'self_eval_draft',
    "currentJobDescription" TEXT,
    "careerPath" TEXT,
    "employeeTargets" TEXT,
    "employeeSubmittedAt" DATETIME,
    "managerTargetRatings" TEXT,
    "managerFeedback" TEXT,
    "overallSummary" TEXT,
    "finalScore" REAL,
    "finalRank" TEXT,
    "managerSubmittedAt" DATETIME,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "archivedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "effectiveTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoleAssignment_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoleAssignment_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FiscalYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" DATETIME,
    "closedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "headId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "grades" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScoreMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeType" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "mappings" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompanyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT,
    "cycleYear" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mode" TEXT NOT NULL DEFAULT 'web',
    "ollamaUrl" TEXT DEFAULT 'http://localhost:11434',
    "ollamaModel" TEXT DEFAULT 'llama2',
    "resultExplanationTmpl" TEXT NOT NULL DEFAULT 'Please help write a professional self-evaluation...',
    "managerFeedbackTmpl" TEXT NOT NULL DEFAULT 'Please help write constructive manager feedback...',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_ldapDN_key" ON "User"("ldapDN");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "TargetSetting_employeeId_cycleYear_key" ON "TargetSetting"("employeeId", "cycleYear");

-- CreateIndex
CREATE UNIQUE INDEX "Review_revieweeId_cycleYear_key" ON "Review"("revieweeId", "cycleYear");

-- CreateIndex
CREATE INDEX "RoleAssignment_reviewerId_effectiveFrom_effectiveTo_idx" ON "RoleAssignment"("reviewerId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "AuditEntry_actorId_timestamp_idx" ON "AuditEntry"("actorId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditEntry_targetType_targetId_idx" ON "AuditEntry"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalYear_year_key" ON "FiscalYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeType_type_key" ON "EmployeeType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreMapping_employeeType_grade_key" ON "ScoreMapping"("employeeType", "grade");

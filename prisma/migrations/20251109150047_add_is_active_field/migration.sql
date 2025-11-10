/*
  Warnings:

  - You are about to alter the column `roles` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "roles" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
INSERT INTO "new_User" ("authProvider", "createdAt", "department", "email", "employeeId", "employmentStatus", "fullName", "grade", "id", "jobTitle", "ldapDN", "ldapSyncedAt", "managerId", "passwordHash", "roles", "updatedAt", "username") SELECT "authProvider", "createdAt", "department", "email", "employeeId", "employmentStatus", "fullName", "grade", "id", "jobTitle", "ldapDN", "ldapSyncedAt", "managerId", "passwordHash", "roles", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_ldapDN_key" ON "User"("ldapDN");
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

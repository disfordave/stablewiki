/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "recoverKey" TEXT,
    "recoveryQuestionFirst" TEXT,
    "recoveryQuestionSecond" TEXT,
    "recoveryQuestionThird" TEXT,
    "recoveryAnswerFirst" TEXT,
    "recoveryAnswerSecond" TEXT,
    "recoveryAnswerThird" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "email", "id", "name", "role", "updatedAt", "username") SELECT "avatarUrl", "createdAt", "email", "id", "name", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_recoverKey_key" ON "User"("recoverKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

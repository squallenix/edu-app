-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT';

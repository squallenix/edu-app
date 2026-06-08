/*
  Warnings:

  - Added the required column `title` to the `EnrolledExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnrolledExam" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "time" TIME(0) NOT NULL;

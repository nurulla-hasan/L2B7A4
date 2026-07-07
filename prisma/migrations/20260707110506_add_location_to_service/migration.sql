/*
  Warnings:

  - Added the required column `location` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "location" VARCHAR(255) NOT NULL;

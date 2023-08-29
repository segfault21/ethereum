/*
  Warnings:

  - A unique constraint covering the columns `[transactionIndex]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Transaction_hash_key";

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionIndex_key" ON "Transaction"("transactionIndex");

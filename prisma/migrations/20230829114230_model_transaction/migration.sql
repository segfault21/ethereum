-- CreateTable
CREATE TABLE "Transaction" (
    "blockHash" TEXT NOT NULL,
    "blockNumber" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "gas" TEXT NOT NULL,
    "gasPrice" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "transactionIndex" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "v" TEXT NOT NULL,
    "r" TEXT NOT NULL,
    "s" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

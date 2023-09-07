export type Block = {
  blockNumber: string;
  transactions: Transaction[];
}

export type Transaction = {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to?: string | null;
  transactionIndex: string;
  value: string;
  type: string;
  v: string;
  r: string;
  s: string;
}

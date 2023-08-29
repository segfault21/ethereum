import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosInstance } from 'axios';
import { Transaction } from './types';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CronService {
  axios: AxiosInstance;
  start: number;
  apiKey: string;
  constructor(private prisma: PrismaService) {
    this.axios = axios.create({
      baseURL: 'https://api.etherscan.io',
    });
    this.apiKey = process.env.API_KEY;
    this.start = parseInt(process.env.START_BLOCK, 10);
  }
  async create(t: Transaction) {
    const input: Prisma.TransactionUncheckedCreateInput = {
      blockHash: t.blockHash,
      blockNumber: t.blockNumber,
      from: t.from,
      gas: t.gas,
      gasPrice: t.gasPrice,
      hash: t.hash,
      input: t.input,
      nonce: t.nonce,
      to: t.to,
      transactionIndex: t.transactionIndex,
      value: t.value,
      type: t.type,
      v: t.v,
      r: t.r,
      s: t.s,
    };
    await this.prisma.transaction.create({
      data: input,
    });
  }

  async update(t: Transaction, transaction: Transaction) {
    const input: Prisma.TransactionUncheckedUpdateInput = {
      blockHash: t.blockHash,
      blockNumber: t.blockNumber,
      from: t.from,
      gas: t.gas,
      gasPrice: t.gasPrice,
      hash: t.hash,
      input: t.input,
      nonce: t.nonce,
      to: t.to,
      transactionIndex: t.transactionIndex,
      value: t.value,
      type: t.type,
      v: t.v,
      r: t.r,
      s: t.s,
    };
    await this.prisma.transaction.update({
      where: {
        transactionIndex: transaction.transactionIndex,
      },
      data: input,
    });
  }
  async upsertTransactions(data: Transaction[]) {
    for (const t of data) {
      const transaction: Transaction = await this.prisma.transaction.findUnique(
        {
          where: {
            transactionIndex: t.transactionIndex,
          },
        },
      );
      if (!transaction) {
        await this.create(t);
        continue;
      }
      if (transaction === t) continue;
      await this.update(t, transaction);
    }
  }
  async getBlock(blockNumber: string) {
    const block = await this.axios.get(
      `/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true`,
      { params: { apikey: this.apiKey } },
    );
    const info: Transaction[] = block.data.result.transactions;
    await this.upsertTransactions(info);
  }
  async startJob() {
    const lastBlockInfo = await this.axios.get(
      `/api?module=proxy&action=eth_blockNumber`,
      { params: { apikey: this.apiKey } },
    );
    const lastBlockNumber: string = lastBlockInfo.data.result;
    let start = this.start;
    const end = parseInt(lastBlockNumber, 16);
    while (start <= end) {
      await this.getBlock(start.toString(16));
      start++;
    }
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async runEveryMinute() {
    await this.startJob();
  }
}

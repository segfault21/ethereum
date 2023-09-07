import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosInstance } from 'axios';
import { Transaction } from './types';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CronService {
  axios: AxiosInstance;
  cap: number;
  apiKey: string;
  constructor(private prisma: PrismaService) {
    this.axios = axios.create({
      baseURL: 'https://api.etherscan.io',
    });
    this.apiKey = process.env.API_KEY;
    this.cap = parseInt(process.env.CAP_COUNT, 10);
  }
  async create(t: Transaction, id) {
    const input: Prisma.TransactionUncheckedCreateInput = {
      blockHash: t.blockHash,
      blockNumber: t.blockNumber,
      from: t.from,
      gas: t.gas,
      gasPrice: t.gasPrice,
      hash: t.hash,
      input: t.input,
      nonce: t.nonce,
      to: t.to !== null ? t.to : undefined,
      transactionIndex: t.transactionIndex,
      value: t.value,
      type: t.type,
      v: t.v,
      r: t.r,
      s: t.s,
      blockId: id,
    };
    await this.prisma.transaction.create({
      data: input,
    });
  }
  async upsertTransactions(data: Transaction[], blockId) {
    for (const t of data) {
      const transaction: Transaction = await this.prisma.transaction.findUnique(
        {
          where: {
            hash: t.hash,
          },
        },
      );
      if (!transaction) {
        await this.create(t, blockId);
      }
    }
  }
  async getBlock(blockNumber: string) {
    const blockInfo = await this.axios.get(
      `/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true`,
      { params: { apikey: this.apiKey } },
    );
    let block = await this.prisma.block.findUnique({
      where: {
        blockNumber: blockNumber,
      },
    })
    if (!block) {
      block = await this.prisma.block.create({
        data: {
          blockNumber: blockNumber,
        },
      });
    }
    const info: Transaction[] = blockInfo.data.result.transactions;
    await this.upsertTransactions(info, block.id);
  }
  async startJob() {
    const lastBlockInfo = await this.axios.get(
      `/api?module=proxy&action=eth_blockNumber`,
      { params: { apikey: this.apiKey } },
    );
    const lastBlockNumber: string = lastBlockInfo.data.result;
    const end = parseInt(lastBlockNumber, 16);
    let cap = end - this.cap;
    while (cap <= end) {
      await this.getBlock(cap.toString(16));
      cap++;
    }
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async runEveryMinute() {
    await this.startJob();
  }
}

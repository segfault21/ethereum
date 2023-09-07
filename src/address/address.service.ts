import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from "../cron/types";

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}
  async getAddress() {
    const total = await this.prisma.block.count();
    const blocks = await this.prisma.block.findMany({
      skip: total > 100 ? total - 100 : undefined,
      include: {
        transactions: true,
      }
    })
    if (!blocks.length) {
      return;
    }
    const allTransactions = blocks.map((b) => b.transactions);
    const transactions: Transaction[] = []
    for (const t of allTransactions) {
      transactions.push(...t);
    }
    return transactions.sort(
      (a, b) => parseInt(b.value, 16) - parseInt(a.value, 16),
    )[0].to;
  }
}

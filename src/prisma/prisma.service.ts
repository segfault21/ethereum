import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { memoize } from 'lodash';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit
{
  logger = new Logger(PrismaService.name);
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        // {
        //   emit: 'stdout',
        //   level: 'info',
        // },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }
  async onModuleInit() {
    await this.$connect();
    this.$on('query', (e) => {
      if (e.duration < 3000) return
      this.logger.log('Query: ' + e.query.slice(0, 500));
      this.logger.log('Params: ' + e.params);
      this.logger.log('Duration: ' + e.duration + 'ms');
    })
  }
  async onModuleDestroy() {
    await this.$disconnect()
  }

  listTables = memoize((schemaName: string) => {
    return this.$queryRaw<
      { tablename: string }[]
    >`SELECT tablename FROM pg_tables WHERE schemaname=${schemaName}`;
  })

  async resetDb(schemaName = 'public') {
    // console.trace('Resetting db')
    const tables = await this.listTables(schemaName)
    const str = `TRUNCATE TABLE ${tables.map(({ tablename }) => `"${schemaName}"."${tablename}"`).join(', ')} CASCADE;`
    await this.$queryRaw(Prisma.sql([str]))

    const relations = await this.$queryRaw<
      { relname: string }[]
    >`SELECT c.relname FROM pg_class AS c JOIN pg_namespace AS n ON 
    c.relnamespace = n.oid WHERE c.relkind='S' AND n.nspname=${schemaName};`

    for (const { relname } of relations) {
      const str = `ALTER SEQUENCE "${schemaName}"."${relname}" RESTART WITH 1;`
      await this.$queryRaw(Prisma.sql([str]))
    }
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as process from 'process';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
dotenv.config({
  override: true,
  path: path.resolve(__dirname, '..', '.env'),
})
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}
bootstrap();

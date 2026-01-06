import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  process.title = 'search';
  const logger = new Logger("SearchBootStrap")

  const rmqurl = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";

  const queue = process.env.SEARCH_QUEUE ?? "search_queue"

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SearchModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqurl],
      queue,
      queueOptions: {
        durable: false
      },
      host: '0.0.0.0',    
    }
  });
  app.enableShutdownHooks()
  await app.listen();

  logger.log(`search RMQ listening on queue ${queue} via ${rmqurl}`)
  
}
bootstrap();

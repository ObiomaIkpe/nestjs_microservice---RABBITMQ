import { NestFactory } from '@nestjs/core';
import { MediaModule } from './media.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  process.title = 'catalog';
  const logger = new Logger("MediaBootStrap")

  const rmqurl = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";

  const queue = process.env.MEDIA_QUEUE ?? "media_queue"

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(MediaModule, {
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

  logger.log(`media RMQ listening on queue ${queue} via ${rmqurl}`)
  
}
bootstrap();

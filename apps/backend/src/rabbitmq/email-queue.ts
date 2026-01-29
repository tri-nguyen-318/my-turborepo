import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Channel } from 'amqplib';
import { SendEmailDto } from 'src/email/dto/send-email.dto';

const QUEUE = 'send_email';

@Injectable()
export class EmailQueue implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rabbitUrl =
      this.configService.get<string>('RABBITMQ_URL') ?? 'amqp://guest:guest@localhost:5672';

    this.connection = await amqp.connect(rabbitUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(QUEUE, { durable: true });
  }

  publishSendEmailJob(email: SendEmailDto) {
    this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(email)), { persistent: true });
  }

  async consumeSendEmailJobs(onMessage: (email: SendEmailDto) => Promise<void>) {
    await this.channel.prefetch(5);

    await this.channel.consume(QUEUE, async msg => {
      if (!msg) return;

      const email: SendEmailDto = JSON.parse(msg.content.toString());

      try {
        await onMessage(email);
        this.channel.ack(msg);
      } catch {
        this.channel.nack(msg, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

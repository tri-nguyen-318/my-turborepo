import amqp from 'amqplib';
import { SendEmailDto } from '../email/dto/send-email.dto';
import { ConfigService } from '@nestjs/config';

const QUEUE = 'send_email';

export class EmailQueue {
  private readonly rabbitUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.rabbitUrl =
      this.configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
  }

  async publishSendEmailJob(email: SendEmailDto) {
    const conn = await amqp.connect(this.rabbitUrl);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(email)), { persistent: true });
    await channel.close();
    await conn.close();
  }

  async consumeSendEmailJobs(onMessage: (email: SendEmailDto) => Promise<void>) {
    const conn = await amqp.connect(this.rabbitUrl);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    channel.consume(QUEUE, async msg => {
      if (msg) {
        const email: SendEmailDto = JSON.parse(msg.content.toString());
        try {
          await onMessage(email);
          channel.ack(msg);
        } catch (err) {
          channel.nack(msg, false, false); // discard on error
        }
      }
    });
  }
}

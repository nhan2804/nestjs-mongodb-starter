import { Module } from '@nestjs/common';
import { ActivitysService } from './activitys.service';
import { ActivitysController } from './activitys.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from './entities/activitys.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [ActivitysController],
  providers: [ActivitysService],
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    // ClientsModule.register([
    //   {
    //     name: 'MATH_SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://localhost:5672'],
    //       queue: 'activities_queue',
    //       queueOptions: {
    //         durable: false,
    //       },
    //     },
    //   },
    // ]),
  ],
})
export class ActivitysModule {}

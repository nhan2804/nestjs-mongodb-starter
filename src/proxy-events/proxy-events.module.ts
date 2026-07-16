import { Module } from '@nestjs/common';
import { ProxyEventsService } from './proxy-events.service';
import { ProxyEventsController } from './proxy-events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyEvent, ProxyEventSchema } from './entities/proxy-events.entity';

@Module({
  controllers: [ProxyEventsController],
  providers: [ProxyEventsService],
  imports: [
    MongooseModule.forFeature([{ name: ProxyEvent.name, schema: ProxyEventSchema }]),
  ],
})
export class ProxyEventsModule {}

import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { ProxyEvent, ProxyEventDocument } from './entities/proxy-events.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProxyEventsService extends AbstractService<ProxyEvent> {
  constructor(
    @InjectModel(ProxyEvent.name)
    readonly model: Model<ProxyEventDocument>,
  ) {
    super(model);
  }
}

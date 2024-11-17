import { Inject, Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Activity, ActivityDocument } from './entities/activitys.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ActivitysService extends AbstractService<Activity> {
  constructor(
    @InjectModel(Activity.name)
    readonly model: Model<ActivityDocument>,
    @Inject('MATH_SERVICE') private client: ClientProxy,
  ) {
    super(model);
  }
  sendActivities(data: any) {
    this.client.emit('activities.created', data);
  }
}

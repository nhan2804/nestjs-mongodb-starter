import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService, ID } from 'src/app/controllers/services/base.service';
import { Submit, SubmitDocument } from './entities/submit.entity';

@Injectable()
export class SubmitsService extends BaseService<Submit> {
  constructor(
    @InjectModel(Submit.name) readonly submitModel: Model<SubmitDocument>,
  ) {
    super(submitModel);
  }
  overview(projectId: ID) {
    return this.submitModel.aggregate([
      {
        $match: { projectId: projectId },

        // $project: { _id: 0 },
      },
      {
        $group: { _id: '$region', count_region: { $sum: 1 } },
      },
    ]);
  }
}

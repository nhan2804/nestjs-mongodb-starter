import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { ExamSession, ExamSessionDocument } from './entities/exam-sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ExamSessionsService extends AbstractService<ExamSession> {
  constructor(
    @InjectModel(ExamSession.name)
    readonly model: Model<ExamSessionDocument>,
  ) {
    super(model);
  }

  async setActive(id: string) {
    await this.model.updateMany({}, { isActive: false });
    return this.model.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }
}

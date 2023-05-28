import { Injectable } from '@nestjs/common';
import { CreateLogsubmitDto } from './dto/create-logsubmit.dto';
import { UpdateLogsubmitDto } from './dto/update-logsubmit.dto';
import { BaseService } from 'src/app/controllers/services/base.service';
import { Logsubmit, LogsubmitDocument } from './entities/logsubmit.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LogsubmitsService extends BaseService<Logsubmit> {
  constructor(
    @InjectModel(Logsubmit.name) readonly submitModel: Model<LogsubmitDocument>,
  ) {
    super(submitModel);
  }
}

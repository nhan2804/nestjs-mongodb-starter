import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { BaseService } from 'src/app/controllers/services/base.service';
import { Dashboard, DashboardDocument } from './entities/dashboard.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DashboardService extends BaseService<Dashboard> {
  constructor(
    @InjectModel(Dashboard.name)
    readonly optionModel: Model<DashboardDocument>,
  ) {
    super(optionModel);
  }
}

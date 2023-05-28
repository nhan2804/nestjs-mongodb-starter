import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Department, DepartmentDocument } from './entities/departments.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DepartmentsService extends AbstractService<Department> {
  constructor(
    @InjectModel(Department.name)
    readonly model: Model<DepartmentDocument>,
  ) {
    super(model);
  }
}

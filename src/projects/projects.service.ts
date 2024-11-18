import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Project, ProjectDocument } from './entities/projects.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProjectsService extends AbstractService<Project> {
  constructor(
    @InjectModel(Project.name)
    readonly model: Model<ProjectDocument>,
  ) {
    super(model);
  }
}

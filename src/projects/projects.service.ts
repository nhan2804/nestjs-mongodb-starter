import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService } from 'src/app/controllers/services/base.service';
import { ProjectDocument, Project } from './entities/project.entity';

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectModel(Project.name)
    readonly model: Model<ProjectDocument>,
  ) {
    super(model);
  }
  addUserToProject(projectId: string | Types.ObjectId, userId: string[]) {
    return this.model.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          userIds: { $each: userId.map((id) => new Types.ObjectId(id)) },
        },
      },
      {
        new: true,
      },
    );
  }
  removeUserFromProject(projectId: string, userId: string[]) {
    return this.model.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          users: { $in: userId.map((id) => new Types.ObjectId(id)) },
        },
      },
      {
        new: true,
      },
    );
  }
}

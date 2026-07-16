import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Agent, AgentDocument } from './entities/agents.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AgentsService extends AbstractService<Agent> {
  constructor(
    @InjectModel(Agent.name)
    readonly model: Model<AgentDocument>,
  ) {
    super(model);
  }
}

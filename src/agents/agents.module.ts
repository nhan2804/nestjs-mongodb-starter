import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from './entities/agents.entity';

@Module({
  controllers: [AgentsController],
  providers: [AgentsService],
  imports: [
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),
  ],
})
export class AgentsModule {}

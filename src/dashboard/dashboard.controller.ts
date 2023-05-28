import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
@Controller('projects/:projectId/dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(
    @Body() createDashboardDto: CreateDashboardDto,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.dashboardService.create({
      ...createDashboardDto,
      projectId,
      optionId: new Types.ObjectId(createDashboardDto?.optionId),
    });
  }

  @Get()
  findAll(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    return this.dashboardService.findAll({ projectId }, undefined, undefined, {
      position: 1,
    });
  }
  @Post('change-position')
  async changePosition(
    @Body() createOptionDto: any,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.dashboardService.changePosition(createOptionDto);
    // const
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.dashboardService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.updateOne(id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.dashboardService.deleteOne(id);
  }
}

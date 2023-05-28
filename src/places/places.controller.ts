import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import { UserLoggin } from 'src/auth/decorators/user';
import { User, UserDocument } from 'src/users/entities/user.entity';
function sameDay(d1, d2) {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}
@Controller('projects/:projectId/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  create(
    @Body() createPlaceDto: CreatePlaceDto,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.placesService.create({
      ...createPlaceDto,
      projectId,
      region: createPlaceDto?.region?.trim(),
    });
  }
  @Post('many')
  createMany(
    @Body() createPlaceDto: CreatePlaceDto[],
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    const data = createPlaceDto?.map((e) => ({
      ...e,
      projectId,
      region: e?.region?.trim(),
    }));
    return this.placesService.baseCreateArray(data);
  }

  @Get()
  findAll(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    return this.placesService.findAll({ projectId }).populate('qc');
  }

  @Get('my')
  findAllMine(
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @UserLoggin() user: UserDocument,
  ) {
    return this.placesService
      .findAll({ projectId, qcId: user?._id })
      .populate('qc');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne({ _id: id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePlaceDto: UpdatePlaceDto & {
      updateTimeCheckIn: Date;
      updateTimeCheckOut: Date;
    },
  ) {
    // const check = sameDay(new Date(place?.timeCheckIn), new Date());
    if (updatePlaceDto?.updateTimeCheckIn) {
      return this.placesService.baseUpdateOne(id, {
        timeCheckIn: new Date(),
      });
    }
    if (updatePlaceDto?.updateTimeCheckOut) {
      return this.placesService.baseUpdateOne(id, {
        timeCheckOut: new Date(),
      });
    }
    return this.placesService.baseUpdateOne(id, updatePlaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placesService.deleteOne(id);
  }
}

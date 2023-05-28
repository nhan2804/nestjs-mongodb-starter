import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/app/controllers/services/base.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceDocument, Place } from './entities/place.entity';

@Injectable()
export class PlacesService extends BaseService<Place> {
  constructor(
    @InjectModel(Place.name)
    readonly model: Model<PlaceDocument>,
  ) {
    super(model);
  }
}

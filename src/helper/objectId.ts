import { Types } from 'mongoose';
const ObjectId = (id: string) => {
  return new Types.ObjectId(id);
};

export default ObjectId;

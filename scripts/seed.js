const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function seed() {
  const uri = process.env.MONGODB || 'mongodb://root:rootpassword@127.0.0.1:27017/military?authSource=admin';
  await mongoose.connect(uri);
  const usersCol = mongoose.connection.collection('users');
  const hash = await bcrypt.hash('123456', 10);
  const adminHash = await bcrypt.hash('admin@gmail.com', 10);

  // Ensure admin user
  await usersCol.updateOne(
    { username: 'admin@gmail.com' },
    {
      $set: {
        username: 'admin@gmail.com',
        fullName: 'Quản trị viên',
        password: adminHash,
        type: 'SUPER_ADMIN',
      },
    },
    { upsert: true }
  );

  // Operator 1: Attendance
  await usersCol.updateOne(
    { username: 'operator1' },
    {
      $set: {
        username: 'operator1',
        fullName: 'Cán bộ Điểm danh',
        password: hash,
        type: 'OPERATOR',
      },
    },
    { upsert: true }
  );

  // Operator 2: Photography
  await usersCol.updateOne(
    { username: 'operator2' },
    {
      $set: {
        username: 'operator2',
        fullName: 'Cán bộ Chụp ảnh',
        password: hash,
        type: 'OPERATOR',
      },
    },
    { upsert: true }
  );

  console.log('Seeded users successfully:');
  console.log('1. admin@gmail.com / admin@gmail.com (SUPER_ADMIN)');
  console.log('2. operator1 / 123456 (Cán bộ Điểm danh)');
  console.log('3. operator2 / 123456 (Cán bộ Chụp ảnh)');

  await mongoose.disconnect();
}

seed().catch(console.error);

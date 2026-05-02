require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const EMAIL = process.argv[2] || 'admin@nirmansetu.in';
const PASSWORD = process.argv[3] || 'Admin@123';
const NAME = process.argv[4] || 'Admin';

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await Admin.findOne({ email: EMAIL });
  if (exists) {
    console.log(`Admin already exists: ${EMAIL}`);
    process.exit(0);
  }
  await Admin.create({ name: NAME, email: EMAIL, password: PASSWORD });
  console.log(`✅ Admin created:`);
  console.log(`   Email   : ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`\n⚠️  Change this password after first login!`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });

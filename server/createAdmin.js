const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env');
    }

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'Administrator';
      user.password = password;
      await user.save();

      console.log('Administrator account updated successfully.');
      console.log('Email:', email);
    } else {
      user = await User.create({
        fullName: 'JanSamadhan Administrator',
        email,
        password,
        phone: '0000000000',
        address: 'JanSamadhan Headquarters',
        role: 'Administrator',
        department: null
      });

      console.log('Administrator account created successfully.');
      console.log('Email:', email);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Admin creation failed:', error.message);
    process.exit(1);
  }
}

createAdmin();
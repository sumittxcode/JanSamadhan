const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ensure Uploads static directory is served
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Routes Configuration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/officer', require('./routes/officerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Seed Initial Data (Roles, Categories, Admin User)
const seedDatabase = async () => {
  try {
    const Role = require('./models/Role');
    const ComplaintCategory = require('./models/ComplaintCategory');
    const User = require('./models/User');

    // 1. Seed Roles
    const roles = ['Citizen', 'Department Officer', 'Administrator'];
    for (const r of roles) {
      const exists = await Role.findOne({ name: r });
      if (!exists) {
        await Role.create({ name: r, description: `${r} role for JanSamadhan platform` });
        console.log(`Seeded Role: ${r}`);
      }
    }

    // 2. Seed Categories
    const categories = [
      { name: 'Road/Pothole', description: 'Damaged roads, potholes, and traffic barrier issues' },
      { name: 'Garbage Collection', description: 'Overflowing bins, uncollected waste, or littering' },
      { name: 'Water Leakage', description: 'Broken pipes, water supply issues, or contamination' },
      { name: 'Streetlight Problem', description: 'Dark areas, non-functional streetlights' },
      { name: 'Electricity Issue', description: 'Power failures, hanging high-voltage wires, transformer issues' },
      { name: 'Drainage Problem', description: 'Blocked sewers, overflowing drains, stagnation' },
      { name: 'Other', description: 'Miscellaneous civic issues' }
    ];
    for (const cat of categories) {
      const exists = await ComplaintCategory.findOne({ name: cat.name });
      if (!exists) {
        await ComplaintCategory.create(cat);
        console.log(`Seeded Category: ${cat.name}`);
      }
    }

    // 3. Seed Initial Administrator Account (Configured via Server Environment Variables)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jansamadhan.gov.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        fullName: 'JanSamadhan Administrator',
        email: adminEmail,
        phone: '9999999999',
        address: 'JanSamadhan Central Grievance Redressal HQ, New Delhi',
        password: adminPassword, // Automatically hashed by User model pre('save') hook
        role: 'Administrator'
      });
      console.log(`Initialized Administrator account: ${adminEmail}`);
    }

    // 4. Seed Default Officer User (to make testing easy)
    const officerEmail = 'officer@jansamadhan.gov.in';
    const officerExists = await User.findOne({ email: officerEmail });
    if (!officerExists) {
      await User.create({
        fullName: 'Officer Kumar',
        email: officerEmail,
        phone: '8888888888',
        address: 'Municipal Corporation Zonal Office, Delhi',
        password: 'OfficerPass123!',
        role: 'Department Officer',
        department: 'Garbage Collection'
      });
      console.log(`Seeded Default Officer User: ${officerEmail} (password: OfficerPass123!)`);
    }

    // 5. Migrate existing complaints where department is 'Unassigned'
    const Complaint = require('./models/Complaint');
    const unassignedComplaints = await Complaint.find({ department: 'Unassigned' });
    if (unassignedComplaints.length > 0) {
      for (const c of unassignedComplaints) {
        c.department = c.category;
        await c.save();
      }
      console.log(`Migrated ${unassignedComplaints.length} complaints: set department to category`);
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  await seedDatabase();
});

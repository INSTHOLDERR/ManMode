import express from 'express';
import session from 'express-session';
import router from './routers/router.js';
import conn from './connect.js';
import dotenv from 'dotenv';
import nocache from 'nocache';
import authRoutes from './routers/authRouter.js';
import adminRouter from './routers/adminRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import passport from 'passport';
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
app.use(nocache());
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "15mb" }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'manmode-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use('/', router);
app.use('/admin', adminRouter);
app.use(authRoutes);

app.use((req, res) => {
  res.status(404).render('user/404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Seed default admin on startup
async function seedAdmin() {
  try {
    const User = (await import('./models/model.js')).default;
    const adminEmail    = 'admin@manmode.com';
    const adminPassword = 'Admin@123';
    const existing = await User.findOne({ email: adminEmail, isAdmin: true });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: 'Admin', email: adminEmail, password: hashed, isAdmin: true, isActive: true });
      console.log('✅ Default admin created → email: admin@manmode.com | password: Admin@123');
    } else {
      console.log('ℹ️  Admin already exists → email: admin@manmode.com');
    }
  } catch (e) {
    console.error('Admin seed error:', e.message);
  }
}

conn()
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`🔐 Admin panel → http://localhost:${PORT}/admin`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to connect to MongoDB:', error.message);
  });

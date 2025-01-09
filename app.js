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


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(nocache());
const PORT = process.env.PORT || 3001;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "15mb" }));
app.use(express.static('public'));
app.use(express.static('uploads'));



app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecretKey',
    resave: false,
    saveUninitialized: true
}));


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

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});



conn()
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, (error) => {
            if (error) {
                console.error('Failed to start server:', error);
            } else {
                console.log(`Server is running at http://localhost:${PORT}`);
            }
        });
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
    });

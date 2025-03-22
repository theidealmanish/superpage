import express from 'express';
import { Request, Response } from 'express';
import connectDB from './utils/connectDB';
import globalError from './controllers/globalError';
import notFound from './controllers/notFound';
import authRoutes from './routes/auth';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

// init app
const app = express();

// constants
const PORT = process.env.PORT || 8000;
const DB = process.env.DB || '';

// connect to database
connectDB(DB);

// middleware
app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
app.use(morgan('dev'));

// routes
app.use('/api/auth', authRoutes);

// not found
app.use('*', notFound);

// global error handler
app.use(globalError);

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Hello World' });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

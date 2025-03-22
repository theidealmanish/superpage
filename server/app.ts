import express from 'express';
import { Request, Response } from 'express';
import connectDB from './utils/connectDB';
import globalError from './controller/globalError';
import notFound from './controller/notFound';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// constants
const PORT = process.env.PORT || 8000;

// connect to database
const DB = process.env.DB || '';
connectDB(DB);

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

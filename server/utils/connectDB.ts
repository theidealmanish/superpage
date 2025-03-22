import mongoose from 'mongoose';

export default function connectDB(DBUri: string) {
	const db = mongoose.connect(DBUri);
	db.then(() => {
		console.log('Connected to MongoDB');
	}).catch((err) => console.log(err));
}

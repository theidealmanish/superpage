import mongoose from 'mongoose';

interface Transaction {
	from: mongoose.Schema.Types.ObjectId;
	to: mongoose.Schema.Types.ObjectId;
	amount: number;
	type: string;
	status: string;
}

const transactionSchema = new mongoose.Schema<Transaction>({
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'completed', 'failed'],
		required: true,
	},
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

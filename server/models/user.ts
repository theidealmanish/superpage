import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface User extends mongoose.Document {
	name: string;
	username: string;
	email: string;
	password: string;
	walletAddress: string;
	comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<User>({
	name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	walletAddress: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

// encrypt password before saving
userSchema.pre<User>('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

// compare password
userSchema.methods.comparePassword = async function (password: string) {
	return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<User>('User', userSchema);

export default User;

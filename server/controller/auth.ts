import user from '../models/user';
import { Request, Response } from 'express';

const signUp = async (req: Request, res: Response) => {
	try {
		const { name, username, email, password, walletAddress } = req.body;
		const newUser = await user.create({
			name,
			username,
			email,
			password,
			walletAddress,
		});
		res.status(201).json({
			status: 'success',
			message: 'User created successfully',
			data: newUser,
		});
	} catch (error) {
		res.status(400).json({
			status: 'error',
			message: error,
		});
	}
};

const signIn = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const existingUser = await user.findOne({ email });
		if (!existingUser) {
			throw new Error('User not found');
		}
		if (existingUser.password !== password) {
			throw new Error('Invalid credentials');
		}
		res.status(200).json({
			status: 'success',
			message: 'User signed in successfully',
			data: existingUser,
		});
	} catch (error) {
		res.status(400).json({
			status: 'error',
			message: error,
		});
	}
};

export { signUp, signIn };

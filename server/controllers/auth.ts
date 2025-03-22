import user from '../models/user';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { expressjwt } from 'express-jwt';

// register
const register = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { name, username, email, password, walletAddress } = req.body;
		// check if username or email already exists
		const existingUser = await user.findOne({
			$or: [{ username }, { email }],
		});
		if (existingUser) {
			return next(new AppError('User already exists', 400));
		}
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
	}
);

// login
const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		console.log('login', { body: req.body });
		const { identifier, password } = req.body;
		const existingUser = await user.findOne({
			$or: [{ username: identifier }, { email: identifier }],
		});
		console.log('existingUser', existingUser);
		if (!existingUser) {
			return next(new AppError('User not found', 404));
		}
		if (!(await existingUser.comparePassword(password))) {
			return next(new AppError('Invalid Credential', 401));
		}
		res.status(200).json({
			status: 'success',
			message: 'User signed in successfully',
			data: existingUser,
		});
	}
);

// check if the user is logged in
export const isLoggedIn = expressjwt({
	secret: (process.env.JWT_SECRET as string) || '',
	algorithms: ['HS256'],
	getToken: function (req: Request) {
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			return req.headers.authorization.split(' ')[1];
		}
		return undefined;
	},
});

export { login, register };

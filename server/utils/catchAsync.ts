import { Request, Response, NextFunction } from 'express';

// higher order function for catch async
export default function catchAsync(fn: Function) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

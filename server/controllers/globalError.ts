export default function globalError(err: any, req: any, res: any, next: any) {
	console.log(err);
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'fail';
	return res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
}

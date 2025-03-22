import axios from 'axios';

// create an instance of axios
const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	withCredentials: true,
	headers: {
		AccessControlAllowOrigin: '*',
		AccessControlAllowCredentials: true,
	},
});

export default axiosInstance;

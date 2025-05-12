import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface UserProfile {
	name: string;
	username: string;
	avatarUrl: string;
	// Add other user properties as needed
}

const fetchUserProfile = async () => {
	// Replace this with your actual API call
	const token = localStorage.getItem('token');
	if (!token) {
		throw new Error('No authentication token');
	}
	const res = await axios.get('/profile/me');
	console.log('User profile response:', res.data.data);

	return res.data.data;
};

export function useUserProfile() {
	return useQuery({
		queryKey: ['userProfile'],
		queryFn: fetchUserProfile,
		// Only fetch when we have a token
		enabled: !!localStorage.getItem('token'),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

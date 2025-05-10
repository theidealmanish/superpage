import { useQuery } from '@tanstack/react-query';

interface UserProfile {
	name: string;
	username: string;
	avatarUrl: string;
	// Add other user properties as needed
}

const fetchUserProfile = async (): Promise<UserProfile> => {
	// Replace this with your actual API call
	const token = localStorage.getItem('token');
	if (!token) {
		throw new Error('No authentication token');
	}

	// Example API call:
	// const response = await fetch('/api/user/profile', {
	//   headers: { Authorization: `Bearer ${token}` }
	// });
	// if (!response.ok) throw new Error('Failed to fetch user profile');
	// return response.json();

	// For now, return dummy data
	return {
		name: 'Jane Doe',
		username: 'janedoe',
		avatarUrl: '',
	};
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

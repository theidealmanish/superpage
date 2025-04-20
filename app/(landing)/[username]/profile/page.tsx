'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Edit2,
	Save,
	Globe,
	MapPin,
	Twitter,
	Youtube,
	Linkedin,
	Github,
	Loader2,
} from 'lucide-react';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { getUsername } from '@/lib/getUsername';

// Define the Profile interface
interface Profile {
	_id?: string;
	user: string;
	bio: string;
	country: string;
	socials: {
		twitter: string;
		youtube: string;
		linkedin: string;
		github: string;
	};
}

// Create form validation schema
const profileSchema = z.object({
	bio: z.string().max(500, { message: 'Bio must be less than 500 characters' }),
	country: z.string().min(1, { message: 'Please select a country' }),
	socials: z.object({
		twitter: z.string().optional(),
		youtube: z.string().optional(),
		linkedin: z.string().optional(),
		github: z.string().optional(),
	}),
});

// List of countries for dropdown
const countries = [
	'United States',
	'Canada',
	'United Kingdom',
	'Australia',
	'Germany',
	'France',
	'Japan',
	'Nepal',
	'India',
	'Brazil',
	'Nigeria',
	'South Africa',
	'China',
	'Russia',
	'Mexico',
	'Spain',
	'Italy',
	'South Korea',
];

export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [user, setUser] = useState<any | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();
	const [wallet, setWallet] = useState<any | null>(null);
	let { username } = useParams();
	username = getUsername(username);

	const form = useForm<z.infer<typeof profileSchema>>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			bio: '',
			country: '',
			socials: {
				twitter: '',
				youtube: '',
				linkedin: '',
				github: '',
			},
		},
	});

	// Fetch profile data
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setIsLoading(true);

				// First get user info
				const userResponse = await axios.get('/auth/current-user');
				setUser(userResponse.data.data);
				console.log(userResponse.data.data);

				// get wallet
				const walletResponse = await axios.get('/wallets/stellar/get-wallet');
				setWallet(walletResponse.data.data.stellar.accountId);
				console.log(walletResponse.data.data.stellar.accountId);

				// Then get profile
				const profileResponse = await axios.get(`/profile/${username}`);
				setProfile(profileResponse.data.data);
				console.log(profileResponse.data.data);

				// Set form values
				form.reset({
					bio: profileResponse.data.data.bio,
					country: profileResponse.data.data.country,
					socials: {
						twitter: profileResponse.data.data.socials.twitter || '',
						youtube: profileResponse.data.data.socials.youtube || '',
						linkedin: profileResponse.data.data.socials.linkedin || '',
						github: profileResponse.data.data.socials.github || '',
					},
				});
				setError(null);
			} catch (err) {
				console.error('Failed to fetch profile:', err);
				setError(
					'Failed to load profile data. You may need to create a profile first.'
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const createWallet = async () => {
		try {
			const response = await axios.post('/wallets/stellar/create-account');
			console.log('Wallet created:', response.data.data);
			setWallet(response.data.data.publicKey);
		} catch (err) {
			console.error('Failed to create wallet:', err);
			setError('Failed to create wallet. Please try again.');
		}
	};

	const onSubmit = async (values: z.infer<typeof profileSchema>) => {
		setIsSaving(true);

		try {
			const response = await axios.post('/profile', values);
			console.log('Profile updated:', response.data);
			router.push(`/${user.username}`);
			setProfile(response.data);
			setError(null);
			setIsEditing(false);
		} catch (err) {
			console.error('Failed to update profile:', err);
			setError('Failed to update profile. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto mt-16'>
				<div className='max-w-3xl mx-auto'>
					<div className='flex items-center gap-4 mb-6'>
						<Skeleton className='h-16 w-16 rounded-full' />
						<div className='space-y-2'>
							<Skeleton className='h-6 w-40' />
							<Skeleton className='h-4 w-60' />
						</div>
					</div>
					<Card>
						<CardHeader>
							<Skeleton className='h-8 w-40' />
						</CardHeader>
						<CardContent className='space-y-6'>
							<Skeleton className='h-20 w-full' />
							<Skeleton className='h-10 w-1/2' />
							<div className='grid grid-cols-2 gap-4'>
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-10 mt-16'>
			<div className='max-w-3xl mx-auto'>
				{error && (
					<Alert className='mb-6'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className='flex flex-col sm:flex-row sm:items-center gap-4 mb-8'>
					<Avatar className='h-16 w-16 sm:h-20 sm:w-20'>
						<AvatarImage
							src={`https://api.dicebear.com/7.x/initials/svg?seed=${
								user?.name || 'User'
							}`}
						/>
						<AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
					</Avatar>

					<div>
						<h1 className='text-2xl font-bold'>{user?.name || 'User'}</h1>
						<p className='text-gray-500'>@{user?.username || 'username'}</p>
						{profile?.country && (
							<div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
								<MapPin size={14} />
								<span>{profile.country}</span>
							</div>
						)}
					</div>

					<div className='sm:ml-auto'>
						<Button
							variant={isEditing ? 'outline' : 'default'}
							onClick={() => setIsEditing(!isEditing)}
							disabled={isSaving}
							className='gap-2'
						>
							{isEditing ? (
								<>Cancel</>
							) : (
								<>
									<Edit2 size={16} />
									Edit Profile
								</>
							)}
						</Button>
					</div>
				</div>

				<Tabs defaultValue='profile'>
					<TabsList className='mb-6'>
						<TabsTrigger value='profile'>Profile</TabsTrigger>
						<TabsTrigger value='activity'>Activity</TabsTrigger>
						<TabsTrigger value='settings'>Settings</TabsTrigger>
					</TabsList>

					<TabsContent value='profile'>
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									{isEditing
										? 'Edit your profile information below.'
										: 'View your profile information.'}
								</CardDescription>
							</CardHeader>

							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)}>
									<CardContent className='space-y-6'>
										{/* Bio */}
										<FormField
											control={form.control}
											name='bio'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bio</FormLabel>
													{isEditing ? (
														<>
															<FormControl>
																<Textarea
																	placeholder='Tell us about yourself...'
																	className='resize-none'
																	rows={4}
																	{...field}
																/>
															</FormControl>
															<FormDescription>
																Brief description about yourself. Max 500
																characters.
															</FormDescription>
															<FormMessage />
														</>
													) : (
														<div className='p-4 bg-gray-50 rounded-md text-gray-700'>
															{profile?.bio || 'No bio provided.'}
														</div>
													)}
												</FormItem>
											)}
										/>

										{/* Country */}
										<FormField
											control={form.control}
											name='country'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Country</FormLabel>
													{isEditing ? (
														<>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder='Select your country' />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{countries.map((country) => (
																		<SelectItem key={country} value={country}>
																			{country}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</>
													) : (
														<div className='flex items-center gap-2 text-gray-700'>
															<Globe size={16} />
															{profile?.country || 'Not specified'}
														</div>
													)}
												</FormItem>
											)}
										/>

										{/* Social Links */}
										<div>
											<h3 className='text-lg font-medium mb-3'>Social Links</h3>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
												{/* Twitter */}
												<FormField
													control={form.control}
													name='socials.twitter'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Twitter size={16} className='text-[#1DA1F2]' />
																Twitter
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input
																			placeholder='https://twitter.com/username'
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.twitter ? (
																<a
																	href={profile.socials.twitter}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-blue-500 hover:underline'
																>
																	{profile.socials.twitter.replace(
																		'https://twitter.com/',
																		'@'
																	)}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* Facebook */}
												<FormField
													control={form.control}
													name='socials.youtube'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Youtube size={16} className='text-[#FF0000]' />
																Youtube
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='@username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.youtube ? (
																<span>{profile?.socials?.youtube}</span>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* LinkedIn */}
												<FormField
													control={form.control}
													name='socials.linkedin'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Linkedin
																	size={16}
																	className='text-[#0A66C2]'
																/>
																LinkedIn
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input
																			placeholder='https://linkedin.com/in/username'
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.linkedin ? (
																<a
																	href={profile.socials.linkedin}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-[#0A66C2] hover:underline'
																>
																	{profile.socials.linkedin.replace(
																		'https://linkedin.com/in/',
																		''
																	)}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* GitHub */}
												<FormField
													control={form.control}
													name='socials.github'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Github size={16} />
																GitHub
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.github ? (
																<a
																	href={profile.socials.github}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.github.replace(
																		'https://github.com/',
																		''
																	)}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>
											</div>
										</div>
										<div>
											{/* create wallet as well */}
											<h3 className='text-lg font-medium mb-3'>Wallet</h3>
											<div>
												{/* button to create wallet */}

												{!wallet ? (
													<Button
														variant='outline'
														className='bg-primary hover:bg-primary/85 hover:text-white text-white h-10 cursor-pointer'
														onClick={createWallet}
														type='button'
													>
														<Globe size={16} className='text-white' />
														Create Wallet
													</Button>
												) : (
													<div className='flex items-center gap-2 text-gray-700'>
														<Globe size={16} />
														<span>{wallet}</span>
													</div>
												)}
											</div>
										</div>
									</CardContent>

									{isEditing && (
										<CardFooter className='flex justify-items-end mt-4'>
											<Button type='submit' disabled={isSaving}>
												{isSaving ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Saving...
													</>
												) : (
													<>
														<Save className='mr-2 h-4 w-4' />
														Save Changes
													</>
												)}
											</Button>
										</CardFooter>
									)}
								</form>
							</Form>
						</Card>
					</TabsContent>

					<TabsContent value='activity'>
						<Card>
							<CardHeader>
								<CardTitle>Activity</CardTitle>
								<CardDescription>
									Your recent activity and interactions.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-10'>
									<p className='text-gray-500'>
										No recent activity to display.
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='settings'>
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
								<CardDescription>
									Manage your account preferences and settings.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-6'>
									<div>
										<h3 className='text-lg font-medium'>Email Notifications</h3>
										<p className='text-gray-500 text-sm mt-1'>
											Configure what emails you want to receive.
										</p>
										<div className='mt-4'>
											{/* Settings content would go here */}
											<p className='text-center text-gray-500 py-4'>
												Settings options coming soon.
											</p>
										</div>
									</div>
									<Separator />
									<div>
										<h3 className='text-lg font-medium'>Privacy</h3>
										<p className='text-gray-500 text-sm mt-1'>
											Control your profile visibility and data sharing
											preferences.
										</p>
										<div className='mt-4'>
											{/* Privacy content would go here */}
											<p className='text-center text-gray-500 py-4'>
												Privacy options coming soon.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

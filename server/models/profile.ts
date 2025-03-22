import mongoose from 'mongoose';

interface Profile {
	user: string;
	bio: string;
	country: string;
	socials: {
		twitter: string;
		facebook: string;
		linkedin: string;
		github: string;
	};
}

const profileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	bio: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	socials: {
		twitter: {
			type: String,
		},
		facebook: {
			type: String,
		},
		linkedin: {
			type: String,
		},
		github: {
			type: String,
		},
	},
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;

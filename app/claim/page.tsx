'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRClaimProps {
	mintAddress: string;
	recipientWallet: string;
}

const QRClaimComponent: React.FC<QRClaimProps> = ({
	mintAddress,
	recipientWallet,
}) => {
	const [success, setSuccess] = useState<boolean>(false);

	const claimPayload = {
		mint: mintAddress,
		recipient: recipientWallet,
	};

	const claimUrl = `https://superpa.ge/api/claim?payload=${encodeURIComponent(
		btoa(JSON.stringify(claimPayload))
	)}`;
	console.log('Claim URL:', claimUrl);

	return (
		<div className='text-center space-y-4'>
			<h2 className='text-xl font-bold'>Claim Your Token</h2>
			<div className='flex flex-col items-center gap-2'>
				<QRCodeSVG value={claimUrl} size={180} />
				<p className='text-sm text-muted-foreground'>
					Scan to claim your token instantly
				</p>
				{success && <p className='text-green-600'>✅ Claimed!</p>}
			</div>
		</div>
	);
};

export default QRClaimComponent;

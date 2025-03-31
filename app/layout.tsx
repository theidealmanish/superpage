import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import MainNav from '@/components/MainNav';
import { Toaster } from 'sonner';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'SuperPage',
	description: 'Your front page on internet and web3',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<MainNav />
				<main className=''>{children}</main>
				<Toaster richColors />
				{/* <Footer /> */}
			</body>
		</html>
	);
}

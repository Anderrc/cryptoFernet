import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'CryptoFernet - Secure Encryption and Decryption Tool',
	description:
		'CryptoFernet is a powerful and user-friendly tool for encrypting and decrypting messages using the Fernet algorithm. Protect your sensitive information with ease.',
	keywords:
		'Fernet, encryption, decryption, cybersecurity, data protection, secure messaging',
	authors: [{ name: 'Anderson Castaño', url: 'https://anderc-dev.vercel.app/' }],
	creator: 'AndercDev',
	publisher: 'AndercDev',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://CryptoFernet.com',
		title: 'CryptoFernet - Secure Encryption and Decryption Tool',
		description:
			'Protect your sensitive information with CryptoFernet, a powerful Fernet encryption and decryption tool.',
		siteName: 'CryptoFernet',
		images: [
			{
				url: 'https://CryptoFernet.com/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'CryptoFernet - Secure Encryption and Decryption Tool',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'CryptoFernet - Secure Encryption and Decryption Tool',
		description:
			'Protect your sensitive information with CryptoFernet, a powerful Fernet encryption and decryption tool.',
		creator: '@YourTwitterHandle',
		images: ['https://CryptoFernet.com/twitter-image.jpg'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	// verification: {
	// 	google: 'your-google-site-verification-code',
	// 	yandex: 'your-yandex-verification-code',
	// 	yahoo: 'your-yahoo-verification-code',
	// },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body className={inter.className}>{children}</body>
		</html>
	);
}


const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(buffer) {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

function base64UrlDecode(str) {
	const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

async function deriveKeys(key) {
	const rawKey = new Uint8Array(base64UrlDecode(key));
	if (rawKey.length !== 32) {
		throw new Error(`Invalid key length: ${rawKey.length}`);
	}

	const signingKey = await crypto.subtle.importKey(
		'raw',
		rawKey.slice(0, 16),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);

	const encryptionKey = await crypto.subtle.importKey(
		'raw',
		rawKey.slice(16),
		{ name: 'AES-CBC', length: 128 },
		false,
		['encrypt', 'decrypt']
	);

	return [signingKey, encryptionKey];
}

export async function encrypt(plaintext, key) {
	const [signingKey, encryptionKey] = await deriveKeys(key);

	const iv = crypto.getRandomValues(new Uint8Array(16));
	const timestamp = new Uint8Array(8);
	const view = new DataView(timestamp.buffer);
	view.setBigUint64(0, BigInt(Math.floor(Date.now() / 1000)), false);

	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-CBC', iv },
		encryptionKey,
		encoder.encode(plaintext).buffer
	);

	const dataToSign = new Uint8Array([
		0x80,
		...timestamp,
		...iv,
		...new Uint8Array(ciphertext),
	]);

	const hmac = await crypto.subtle.sign('HMAC', signingKey, dataToSign);

	const token = new Uint8Array([...dataToSign, ...new Uint8Array(hmac)]);
	return base64UrlEncode(token.buffer);
}

export async function decrypt(token, key) {
	try {
		const data = new Uint8Array(base64UrlDecode(token));

		if (data.length < 33) {
			throw new Error('Token is too short');
		}

		const version = data[0];
		// const timestamp = data.slice(1, 9);
		const iv = data.slice(9, 25);
		const ciphertext = data.slice(25, -32);
		const hmac = data.slice(-32);

		if (version !== 0x80) {
			throw new Error(`Invalid Fernet version: ${version.toString(16)}`);
		}

		const [signingKey, encryptionKey] = await deriveKeys(key);

		// const calculatedHmac = await crypto.subtle.sign(
		// 	'HMAC',
		// 	signingKey,
		// 	data.slice(0, -32)
		// );

		if (
			!(await crypto.subtle.verify(
				'HMAC',
				signingKey,
				hmac,
				data.slice(0, -32)
			))
		) {
			throw new Error('Invalid HMAC');
		}

		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-CBC', iv },
			encryptionKey,
			ciphertext.buffer
		);

		return decoder.decode(decrypted);
	} catch (error) {
		console.error('Decryption failed:', error.message);
		throw error;
	}
}

export function tryParseJSON(text) {
	try {
		const obj = JSON.parse(text);
		return JSON.stringify(obj, null, 2);
	} catch {
		return text;
	}
}
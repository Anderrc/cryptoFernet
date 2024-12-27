'use client';

import { useState } from 'react';
import { encrypt, decrypt } from '../lib/fernet';

export default function Home() {
	const [key, setKey] = useState('');
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const validateKey = (key: string) => {
		try {
			if (key.length !== 44) {
				throw new Error(
					'Key must be 32 bytes (Base64 encoded, 44 characters).',
				);
			}
		} catch (error) {
			setError((error as Error).message);
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setOutput('');
		setLoading(true);
		try {
			if (!validateKey(key)) return;

			const result =
				mode === 'encrypt'
					? await encrypt(input, key)
					: await decrypt(input, key);
			setOutput(result);
		} catch (error) {
			setError(`Error: ${(error as Error).message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(output);
		alert('Copied to clipboard!');
	};

	const syntaxHighlight = (json: string) => {
		if (typeof json !== 'string') {
			json = JSON.stringify(json, null, 2);
		}
		return json.replace(
			/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
			match => {
				let className = 'text-gray-800'; // default
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						className = 'text-purple-600'; // keys
					} else {
						className = 'text-green-600'; // strings
					}
				} else if (/true|false/.test(match)) {
					className = 'text-blue-600'; // booleans
				} else if (/null/.test(match)) {
					className = 'text-red-600'; // null
				} else if (/^-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?$/.test(match)) {
					className = 'text-orange-600'; // numbers
				}
				return `<span class="${className}">${match}</span>`;
			},
		);
	};

	const formatJson = (jsonString: string) => {
		try {
			if (typeof jsonString === 'string') {
				return syntaxHighlight(JSON.parse(jsonString));
			}
			return syntaxHighlight(jsonString);
		} catch {
			return jsonString;
		}
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center p-24'>
			<h1 className='text-4xl font-bold mb-8'>
				Fernet Encryption/Decryption
			</h1>
			<form onSubmit={handleSubmit} className='w-full max-w-lg'>
				<div className='mb-4'>
					<label
						htmlFor='key'
						className='block text-sm font-medium text-gray-700'>
						Secret Key (Base64 encoded, 32 bytes)
					</label>
					<input
						type='text'
						id='key'
						value={key}
						onChange={e => setKey(e.target.value)}
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
						required
					/>
				</div>
				<div className='mb-4'>
					<label
						htmlFor='input'
						className='block text-sm font-medium text-gray-700'>
						{mode === 'encrypt'
							? 'Text to Encrypt'
							: 'Token to Decrypt'}
					</label>
					<textarea
						id='input'
						value={input}
						onChange={e => setInput(e.target.value)}
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
						rows={4}
						required
					/>
				</div>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700'>
						Mode
					</label>
					<div className='mt-2'>
						<label className='inline-flex items-center'>
							<input
								type='radio'
								className='form-radio'
								name='mode'
								value='encrypt'
								checked={mode === 'encrypt'}
								onChange={() => setMode('encrypt')}
							/>
							<span className='ml-2'>Encrypt</span>
						</label>
						<label className='inline-flex items-center ml-6'>
							<input
								type='radio'
								className='form-radio'
								name='mode'
								value='decrypt'
								checked={mode === 'decrypt'}
								onChange={() => setMode('decrypt')}
							/>
							<span className='ml-2'>Decrypt</span>
						</label>
					</div>
				</div>
				<button
					type='submit'
					className='w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					disabled={loading}>
					{loading
						? 'Processing...'
						: mode === 'encrypt'
						? 'Encrypt'
						: 'Decrypt'}
				</button>
			</form>
			{error && (
				<div className='mt-8 w-full max-w-lg text-red-600'>
					<p>{error}</p>
				</div>
			)}
			{output && (
				<div className='mt-8 w-full max-w-lg'>
					<h2 className='text-xl font-semibold mb-2'>Result:</h2>
					<pre className='bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap'>
						<code
							className='text-sm font-mono whitespace-pre'
							dangerouslySetInnerHTML={{
								__html: formatJson(output),
							}}
						/>
					</pre>
					<button
						onClick={handleCopy}
						className='mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700'>
						Copy to Clipboard
					</button>
				</div>
			)}
		</main>
	);
}


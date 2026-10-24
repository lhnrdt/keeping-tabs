// The dev server for your phone on the same Wi-Fi (`pnpm dev:phone`): over HTTPS, since the
// app's cookies are Secure and phones only keep those over HTTPS, with a self-signed
// certificate for this computer's network address (the phone asks once to trust it).
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';

const PORT = 5173;
const dir = new URL('../.certs/', import.meta.url).pathname;

/** The first private IPv4 address, e.g. 192.168.178.21 */
const address = Object.values(networkInterfaces())
	.flat()
	.find(
		(net) =>
			net?.family === 'IPv4' &&
			!net.internal &&
			/^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))\./.test(net.address) &&
			!net.address.startsWith('172.17.')
	)?.address;
if (!address) throw new Error('No Wi-Fi/LAN address found');

// A new certificate when there is none yet or the address changed
mkdirSync(dir, { recursive: true });
const forAddress = `${dir}address`;
if (!existsSync(`${dir}cert.pem`) || readFileSync(forAddress, 'utf8') !== address) {
	execFileSync(
		'openssl',
		[
			'req',
			'-x509',
			'-newkey',
			'rsa:2048',
			'-nodes',
			'-days',
			'365',
			'-keyout',
			`${dir}key.pem`,
			'-out',
			`${dir}cert.pem`,
			'-subj',
			'/CN=Keeping Tabs dev',
			'-addext',
			`subjectAltName=IP:${address},IP:127.0.0.1,DNS:localhost`
		],
		{ stdio: 'ignore' }
	);
	writeFileSync(forAddress, address);
}

console.log(`\nOn your phone (same Wi-Fi): https://${address}:${PORT}`);
console.log('Accept the certificate warning once; the password is in .env (ACCESS_PASSWORD).\n');
spawn('vite', ['dev', '--host', '0.0.0.0', '--port', String(PORT), '--strictPort'], {
	stdio: 'inherit',
	env: { ...process.env, DEV_HTTPS: dir }
});

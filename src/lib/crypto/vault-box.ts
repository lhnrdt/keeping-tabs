// A vault's letterbox: anyone can put a key in, only the vault can take it out. Someone can end up
// with more than one vault, as an iPhone's Safari and its home screen app keep separate storage,
// and Safari clears a site's storage after a week unused while staying signed in. Each vault has a
// public key, worked out from the vault key; a device puts the group keys it has into the
// person's other vaults with it, without being able to open them. X25519 and AES-256-GCM.
import {
	contextIn,
	fromBase64Url,
	keyIdOf,
	openText,
	sealText,
	textContext,
	toBase64Url
} from './seal';

const BOX = 'box';
const X25519 = { name: 'X25519' } as const;
/** An X25519 private key in PKCS #8, up to its 32 bytes */
const PKCS8_START = Uint8Array.from([
	0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6e, 0x04, 0x22, 0x04, 0x20
]);

async function hashed(label: string, ...parts: Uint8Array[]) {
	const named = new TextEncoder().encode(label);
	const joined = new Uint8Array(named.length + parts.reduce((sum, part) => sum + part.length, 0));
	let at = 0;
	for (const part of [named, ...parts]) {
		joined.set(part, at);
		at += part.length;
	}
	return new Uint8Array(await crypto.subtle.digest('SHA-256', joined as BufferSource));
}

/** The vault's private key, always the same for the same vault */
async function privateKeyOf(vault: string) {
	const secret = await hashed('keeping-tabs-vault-box:', fromBase64Url(vault));
	const pkcs8 = new Uint8Array(PKCS8_START.length + secret.length);
	pkcs8.set(PKCS8_START);
	pkcs8.set(secret, PKCS8_START.length);
	return crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, X25519, true, ['deriveBits']);
}

const importPublic = (publicKey: string) =>
	crypto.subtle.importKey('raw', fromBase64Url(publicKey) as BufferSource, X25519, false, []);

/** What's put in a box opens with this: from both sides' keys, and bound to both */
async function sharedKey(own: CryptoKey, other: string, sender: string, receiver: string) {
	const bits = await crypto.subtle.deriveBits(
		{ ...X25519, public: await importPublic(other) },
		own,
		256
	);
	return toBase64Url(
		await hashed(
			'keeping-tabs-vault-box-key:',
			new Uint8Array(bits),
			fromBase64Url(sender),
			fromBase64Url(receiver)
		)
	);
}

/** The vault's public key, to give to the server; null where the browser can't do X25519 */
export async function boxKeyOf(vault: string) {
	try {
		const { x } = await crypto.subtle.exportKey('jwk', await privateKeyOf(vault));
		return x ?? null;
	} catch {
		return null;
	}
}

/** Text in a vault's box, read by its id like anything sealed with the vault itself */
export async function putInBox(vaultId: string, publicKey: string, text: string) {
	const sender = (await crypto.subtle.generateKey(X25519, true, ['deriveBits'])) as CryptoKeyPair;
	const { x } = await crypto.subtle.exportKey('jwk', sender.publicKey);
	const key = await sharedKey(sender.privateKey, publicKey, x!, publicKey);
	const sealed = await sealText(key, text, textContext(BOX, x));
	const [prefix, , ...rest] = sealed.split('.');
	return [prefix, vaultId, ...rest].join('.');
}

export const isBoxed = (sealed: string) => contextIn(sealed).startsWith(`${BOX}_`);

/** The text in this vault's box; throws if it's not for this vault or has been tampered with */
export async function openBox(vault: string, sealed: string) {
	const sender = contextIn(sealed).slice(BOX.length + 1);
	const receiver = await boxKeyOf(vault);
	if (!receiver) throw new Error('No X25519 here');
	const key = await sharedKey(await privateKeyOf(vault), sender, sender, receiver);
	// The id in front is the vault's; the seal only knows the shared key's
	const [prefix, , ...rest] = sealed.split('.');
	return openText(key, [prefix, await keyIdOf(key), ...rest].join('.'));
}

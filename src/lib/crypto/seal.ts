// End-to-end encryption of a group's text (#110). Sealed text says which key it needs and where it
// belongs: "enc1.<key id>.<context>.<iv and ciphertext>", so the server stores it like any other
// text and any screen can open it, whichever group it came from. The context is authenticated:
// changing it breaks the seal, so text can't be passed off as another row's. AES-256-GCM, from the
// browser's own crypto.

const PREFIX = 'enc1';
const SEALED = /^enc1\.[\w-]{8}\.[\w-]*\.[\w-]+$/;
/** Sealed text anywhere in a longer text, e.g. a CSV file */
export const SEALED_ANYWHERE = /enc1\.[\w-]{8}\.[\w-]*\.[\w-]+/g;
const IV_BYTES = 12;
const KEY_BYTES = 32;

export const toBase64Url = (bytes: Uint8Array) => {
	let text = '';
	for (let i = 0; i < bytes.length; i += 32_768) {
		text += String.fromCharCode(...bytes.subarray(i, i + 32_768));
	}
	return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const fromBase64Url = (text: string) =>
	Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));

export const isSealed = (value: unknown): value is string =>
	typeof value === 'string' && SEALED.test(value);

/** A new key, as text: what goes into the link's fragment */
export const newKey = () => toBase64Url(crypto.getRandomValues(new Uint8Array(KEY_BYTES)));

export const isKey = (value: unknown): value is string =>
	typeof value === 'string' && /^[\w-]{43}$/.test(value);

/** Names a key without giving it away: the start of its hash */
export async function keyIdOf(key: string) {
	const hash = await crypto.subtle.digest('SHA-256', fromBase64Url(key) as BufferSource);
	return toBase64Url(new Uint8Array(hash)).slice(0, 8);
}

const importKey = (key: string) =>
	crypto.subtle.importKey('raw', fromBase64Url(key) as BufferSource, 'AES-GCM', false, [
		'encrypt',
		'decrypt'
	]);

const bound = (context: string) => ({
	additionalData: new TextEncoder().encode(context) as BufferSource
});

/** `context` must be the same when opening: what these bytes belong to */
export async function sealBytes(key: string, bytes: Uint8Array, context = '') {
	const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
	const sealed = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv, ...bound(context) },
		await importKey(key),
		bytes as BufferSource
	);
	const joined = new Uint8Array(IV_BYTES + sealed.byteLength);
	joined.set(iv);
	joined.set(new Uint8Array(sealed), IV_BYTES);
	return joined;
}

export async function openBytes(key: string, joined: Uint8Array, context = '') {
	const opened = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: joined.subarray(0, IV_BYTES) as BufferSource, ...bound(context) },
		await importKey(key),
		joined.subarray(IV_BYTES) as BufferSource
	);
	return new Uint8Array(opened);
}

/** The context of a text: its field, and the row it belongs to if it's bound to one */
export const textContext = (field: string, row = '') => `${field}_${row}`;

export async function sealText(key: string, text: string, context = '') {
	const sealed = await sealBytes(key, new TextEncoder().encode(text), context);
	return `${PREFIX}.${await keyIdOf(key)}.${context}.${toBase64Url(sealed)}`;
}

/** Which key sealed text needs */
export const keyIdIn = (sealed: string) => sealed.split('.')[1];

/** Where sealed text says it belongs; only to be believed once it has been opened */
export const contextIn = (sealed: string) => sealed.split('.')[2];

/** The text; throws if the key doesn't fit or it's been tampered with */
export async function openText(key: string, sealed: string) {
	const [, , context, data] = sealed.split('.');
	const opened = await openBytes(key, fromBase64Url(data), context);
	return new TextDecoder().decode(opened);
}

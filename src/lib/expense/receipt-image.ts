// What a receipt photo may be (#52). Photos live in the database, to stay on the free plan
// without any paid storage, so they're small: the browser shrinks them before sending, the server
// only takes JPEGs up to this size.
export const MAX_RECEIPT_BYTES = 500_000;
export const MAX_RECEIPT_SIDE = 1400;
export const MAX_RECEIPTS_PER_EXPENSE = 5;
/** Keeps a single group from filling the database: about 100 MB */
export const MAX_RECEIPTS_PER_GROUP = 200;

/** A JPEG by its first bytes, whatever the upload calls itself */
export const isJpeg = (bytes: Uint8Array) =>
	bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

/** As text for the database; in pieces, as a photo is too long to pass along in one go */
export function toBase64(bytes: Uint8Array) {
	let text = '';
	for (let i = 0; i < bytes.length; i += 32_768) {
		text += String.fromCharCode(...bytes.subarray(i, i + 32_768));
	}
	return btoa(text);
}

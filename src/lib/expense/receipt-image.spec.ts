import { describe, expect, it } from 'vitest';
import { isJpeg, MAX_RECEIPT_BYTES, toBase64 } from './receipt-image';

describe('isJpeg', () => {
	it('goes by the first bytes', () => {
		expect(isJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
		expect(isJpeg(new TextEncoder().encode('<svg onload="alert(1)">'))).toBe(false);
		expect(isJpeg(new Uint8Array())).toBe(false);
	});
});

describe('toBase64', () => {
	it('takes a photo of the largest size and gives it back whole', () => {
		const bytes = new Uint8Array(MAX_RECEIPT_BYTES).map((_, i) => i % 251);
		const back = Uint8Array.from(atob(toBase64(bytes)), (char) => char.charCodeAt(0));
		expect(back).toEqual(bytes);
	});
});

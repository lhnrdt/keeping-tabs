// A photo made small enough to keep (#52), in the browser: a JPEG at most this wide or high and
// under the size limit. Drawing it anew also leaves out its metadata, like where it was taken.
import { MAX_RECEIPT_BYTES, MAX_RECEIPT_SIDE } from './receipt-image';

const QUALITIES = [0.75, 0.6, 0.45, 0.3];

/** The shrunk photo, or null if the browser can't read it or it stays too large */
export async function shrinkPhoto(file: File): Promise<Blob | null> {
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		return null;
	}
	const scale = Math.min(1, MAX_RECEIPT_SIDE / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	for (const quality of QUALITIES) {
		const blob = await new Promise<Blob | null>((done) =>
			canvas.toBlob(done, 'image/jpeg', quality)
		);
		if (blob && blob.size <= MAX_RECEIPT_BYTES) return blob;
	}
	return null;
}

import { copyText } from './clipboard';

/**
 * Opens the system share sheet where available (G-4), otherwise copies the URL.
 * Returns "copied" when it fell back to the clipboard, so the caller can say so.
 */
export async function shareOrCopy(title: string, url: string): Promise<'shared' | 'copied'> {
	if (navigator.share) {
		try {
			await navigator.share({ title, url });
		} catch {
			// Dismissed by the user
		}
		return 'shared';
	}
	return (await copyText(url)) ? 'copied' : 'shared';
}

/**
 * Shares a message through the system share sheet, else copies it. "copied" when it was
 * copied, "failed" when neither works (the caller then offers it to copy by hand).
 */
export async function shareText(text: string): Promise<'shared' | 'copied' | 'failed'> {
	if (navigator.share) {
		try {
			await navigator.share({ text });
		} catch {
			// Dismissed by the user
		}
		return 'shared';
	}
	return (await copyText(text)) ? 'copied' : 'failed';
}

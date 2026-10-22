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
	await navigator.clipboard.writeText(url);
	return 'copied';
}

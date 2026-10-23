/** A redirect target from a form: only paths of this site (never another host). */
export function safePath(value: unknown, fallback = '/'): string {
	if (typeof value !== 'string') return fallback;
	return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
		? value
		: fallback;
}

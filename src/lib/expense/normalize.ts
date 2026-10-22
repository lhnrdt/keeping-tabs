/** An expense title as lowercase words without accents ("Frühstück!" → "fruhstuck"). */
export const normalizeTitle = (title: string) =>
	title
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();

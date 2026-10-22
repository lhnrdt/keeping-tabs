/**
 * True when `a` becomes `b` with at most one edit: a changed, missing or extra letter, or
 * two neighbouring letters swapped ("resturant" → "restaurant", "pizaz" → "pizza").
 */
export function withinOneEdit(a: string, b: string): boolean {
	if (a === b) return true;
	if (Math.abs(a.length - b.length) > 1) return false;
	let start = 0;
	while (a[start] === b[start]) start++;
	const restA = a.slice(start);
	const restB = b.slice(start);
	return (
		restA.slice(1) === restB.slice(1) || // changed
		restA.slice(1) === restB || // extra in a
		restA === restB.slice(1) || // missing in a
		(restA[0] === restB[1] && restA[1] === restB[0] && restA.slice(2) === restB.slice(2)) // swapped
	);
}

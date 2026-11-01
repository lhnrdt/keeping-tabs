// People's names beside a chart's bars: the chart only has so much room, and names can be long. The
// full names are in the list below or the table for screen readers.
const LONGEST = 12;
/** Roughly the width of a character of the labels, in pixels */
const CHARACTER = 7.5;

/** The name, or the first name if that's what fits, or its start */
export function chartName(name: string) {
	if (name.length <= LONGEST) return name;
	const [first] = name.split(/\s+/);
	return first.length <= LONGEST ? first : `${first.slice(0, LONGEST - 1)}…`;
}

/** The room these names take beside the bars */
export const chartNamesWidth = (names: readonly string[]) =>
	Math.ceil(Math.max(0, ...names.map((name) => chartName(name).length)) * CHARACTER) + 8;

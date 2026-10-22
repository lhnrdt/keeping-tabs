// The form fields of a split: one "split:<memberId>" input per member (SSOT for the
// form component and the server action).
const PREFIX = 'split:';

export const splitInputName = (memberId: string) => `${PREFIX}${memberId}`;

/** Each member's split input from a submitted form, by member id */
export const readSplitInputs = (form: FormData) =>
	Object.fromEntries(
		[...form.entries()]
			.filter(([key]) => key.startsWith(PREFIX))
			.map(([key, value]) => [key.slice(PREFIX.length), String(value)])
	);

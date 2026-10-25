// Searching the expense list (#68): the query from the address, and how it matches in SQL.

/** Long enough for any title */
export const MAX_QUERY = 80;

export const readQuery = (params: URLSearchParams) =>
	(params.get('q') ?? '').trim().slice(0, MAX_QUERY);

/** LIKE's escape character in the search, which needs no escaping in SQL or JavaScript */
export const LIKE_ESCAPE = '!';

/** A LIKE pattern that matches the query anywhere, its own %, _ and ! taken literally */
export const likePattern = (query: string) =>
	`%${query.toLowerCase().replace(/[!%_]/g, (char) => `!${char}`)}%`;

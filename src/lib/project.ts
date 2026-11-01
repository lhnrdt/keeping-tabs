/** Where the app's code lives, open for anyone to read (#165) */
export const PROJECT_URL = 'https://github.com/lhnrdt/keeping-tabs';

/** Where to report a problem or idea (#83), with the version already filled in */
export const reportUrl = (version: string) =>
	`${PROJECT_URL}/issues/new?${new URLSearchParams({ body: `\n\nApp version: ${version}` })}`;

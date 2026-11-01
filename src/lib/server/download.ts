/** "Trip to Oslo" → Trip to Oslo.csv; the name may have any characters, so it's encoded */
export const downloadHeaders = (name: string, extension: string, contentType: string) => ({
	'content-type': contentType,
	'content-disposition': `attachment; filename="export.${extension}"; filename*=UTF-8''${encodeURIComponent(`${name}.${extension}`)}`,
	'cache-control': 'private, no-store'
});

// One receipt photo (#52). Behind the group's link and password like everything of the group.
import { error } from '@sveltejs/kit';
import { requireGroup } from '#lib/server/context.ts';
import { receiptImage } from '#lib/server/receipts.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	const image = await receiptImage(locals.db, group.id, params.id, params.receiptId);
	if (!image) error(404);
	return new Response(image, {
		headers: {
			// Sealed in an encrypted group (#110): the browser opens it
			'content-type': group.keyId ? 'application/octet-stream' : 'image/jpeg',
			// A photo never changes; a new one has a new address
			'cache-control': 'private, max-age=31536000, immutable'
		}
	});
};

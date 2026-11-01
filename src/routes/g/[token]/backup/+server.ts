// The group as a backup file (#57), to keep or to restore as a new group.
import { backupOf } from '#lib/server/backup.ts';
import { requireGroup } from '#lib/server/context.ts';
import { downloadHeaders } from '#lib/server/download.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	return new Response(JSON.stringify(await backupOf(locals.db, group)), {
		headers: downloadHeaders(`${group.name} backup`, 'json', 'application/json; charset=utf-8')
	});
};

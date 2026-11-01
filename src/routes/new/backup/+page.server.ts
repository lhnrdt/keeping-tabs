import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { parseBackup } from '#lib/backup/parse.ts';
import { restoreBackup } from '#lib/server/backup.ts';
import type { Actions } from './$types';

/** Years of a busy group's history are well below this */
const MAX_FILE_BYTES = 2_000_000;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const file = (await request.formData()).get('file');
		if (!(file instanceof File) || file.size === 0)
			return fail(400, { error: 'backup_missing' as const });
		if (file.size > MAX_FILE_BYTES) return fail(400, { error: 'import_too_large' as const });
		const backup = parseBackup(await file.text());
		if (!backup.ok) return fail(400, { error: backup.error });
		const token = await restoreBackup(locals.db, backup.value);
		redirect(303, resolve('/g/[token]', { token }));
	}
};

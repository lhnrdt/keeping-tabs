import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { group } = await parent();
	if (!group.keyId) redirect(303, `${resolve('/g/[token]', { token: params.token })}?tab=group`);
};

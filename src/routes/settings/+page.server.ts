// Moved to your profile (#146); old links and bookmarks still arrive there.
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => redirect(308, resolve('/you'));

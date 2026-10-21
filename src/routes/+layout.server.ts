import type { LayoutServerLoad } from './$types';

/** Apple devices get Konsta's iOS look, everything else Material. Decided on the server so there's no flash. */
export const load: LayoutServerLoad = ({ request }) => ({
	theme: /iPhone|iPad|iPod|Macintosh/.test(request.headers.get('user-agent') ?? '')
		? ('ios' as const)
		: ('material' as const)
});

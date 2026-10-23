<script lang="ts">
	import { version } from '$app/env';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
</script>

<footer class="space-y-2 p-4 text-center text-xs">
	<a class="block underline-offset-2 opacity-70 hover:underline" href={resolve('/privacy')}
		>{m.privacy_title()}</a
	>
	<span class="block opacity-50" data-testid="app-version">v{version}</span>
</footer>

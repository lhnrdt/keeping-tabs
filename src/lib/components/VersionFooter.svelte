<script lang="ts">
	import { version } from '$app/env';
	import LanguageSwitch from './LanguageSwitch.svelte';
</script>

<footer class="space-y-2 p-4 text-center text-xs">
	<LanguageSwitch />
	<span class="block opacity-50" data-testid="app-version">v{version}</span>
</footer>

<script lang="ts">
	// The app's version; press and hold it for the project on GitHub (#165)
	import { version } from '$app/env';
	import { longPress } from '#lib/actions/long-press.ts';
	import { PROJECT_URL } from '#lib/project.ts';
</script>

<footer class="p-4 text-center text-xs">
	<span
		class="block text-muted select-none [-webkit-touch-callout:none]"
		data-testid="app-version"
		use:longPress={() => window.open(PROJECT_URL, '_blank', 'noopener')}>v{version}</span
	>
</footer>

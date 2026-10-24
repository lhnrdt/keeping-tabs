<script lang="ts">
	// A quiet illustration (the nature theme's motif) with one line of text, for empty lists and
	// calm moments.
	import ThemeMotif from './illustrations/ThemeMotif.svelte';

	let { text, role }: { text: string; role?: 'status' } = $props();
</script>

<div class="flex flex-col items-center gap-3 px-4 py-8 text-center" {role}>
	<ThemeMotif />
	<p class="max-w-xs text-muted">{text}</p>
</div>

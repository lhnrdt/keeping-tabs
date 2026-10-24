<script lang="ts">
	// Brings a deleted group back (G-3); busy while it does (#58).
	import { enhance } from '$app/forms';
	import { Preloader } from 'konsta/svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { groupId }: { groupId: string } = $props();

	const submission = new Submission();
</script>

<form method="POST" action="?/restoreGroup" use:enhance={submission.enhance}>
	<input type="hidden" name="groupId" value={groupId} />
	<button
		type="submit"
		disabled={submission.pending}
		aria-busy={submission.pending}
		class="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-4 py-2 text-sm font-medium text-accent focus-visible:ring-2 dark:bg-surface-muted-night dark:text-accent-night"
	>
		{#if submission.pending}<Preloader class="h-4 w-4" />{/if}
		{m.restore_group()}
	</button>
</form>

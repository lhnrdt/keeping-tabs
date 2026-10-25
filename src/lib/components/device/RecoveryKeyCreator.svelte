<script lang="ts">
	// Creates a recovery key and shows it once (A-16).
	import { enhance } from '$app/forms';
	import { Block } from 'konsta/svelte';
	import CopyButton from '#lib/components/CopyButton.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { recoveryKey }: { recoveryKey?: string } = $props();

	const submission = new Submission();
</script>

{#if recoveryKey}
	<Block>
		<p class="text-sm text-muted">{m.recovery_shown()}</p>
		<p
			class="mt-3 rounded-2xl bg-surface-muted p-4 text-center font-display text-2xl tracking-wider select-all dark:bg-surface-muted-night"
			data-testid="recovery-key"
		>
			{recoveryKey}
		</p>
	</Block>
	<Block>
		<CopyButton text={recoveryKey} label={m.recovery_copy()} />
	</Block>
{:else}
	<form method="POST" action="?/createRecoveryKey" use:enhance={submission.enhance}>
		<Block>
			<p class="mb-3 text-sm text-muted">{m.recovery_replace_hint()}</p>
			<SubmitButton pending={submission.pending} tonal>{m.recovery_create()}</SubmitButton>
		</Block>
	</form>
{/if}

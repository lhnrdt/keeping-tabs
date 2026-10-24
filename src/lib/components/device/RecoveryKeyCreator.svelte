<script lang="ts">
	// Creates a recovery key and shows it once (A-16).
	import { enhance } from '$app/forms';
	import { Block, Button, Toast } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { recoveryKey }: { recoveryKey?: string } = $props();

	const submission = new Submission();
	let copied = $state(false);

	async function copy(key: string) {
		await navigator.clipboard.writeText(key);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
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
		<Button large rounded tonal type="button" class="gap-2" onclick={() => copy(recoveryKey)}>
			<Icon name="copy" />
			{m.recovery_copy()}
		</Button>
	</Block>
	<Toast position="center" opened={copied}>{m.recovery_copied()}</Toast>
{:else}
	<form method="POST" action="?/createRecoveryKey" use:enhance={submission.enhance}>
		<Block>
			<p class="mb-3 text-sm text-muted">{m.recovery_replace_hint()}</p>
			<SubmitButton pending={submission.pending} tonal>{m.recovery_create()}</SubmitButton>
		</Block>
	</form>
{/if}

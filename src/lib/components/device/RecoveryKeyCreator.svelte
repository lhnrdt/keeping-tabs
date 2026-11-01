<script lang="ts">
	// Creates a recovery key and shows it once (A-16). It's made here: the server never sees it,
	// since it also brings back your groups' keys (#110).
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Block } from 'konsta/svelte';
	import CopyButton from '#lib/components/CopyButton.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { newRecovery, syncKeys } from '#lib/crypto/vault.ts';
	import { m } from '#lib/paraglide/messages.js';

	const submission = new Submission();
	let recoveryKey = $state<string>();

	const create: SubmitFunction = async (input) => {
		const { key, proof, vault } = await newRecovery();
		input.formData.set('recoveryProof', proof);
		input.formData.set('recoveryVault', vault);
		const after = submission.enhance(input) as Exclude<
			ReturnType<SubmitFunction>,
			Promise<unknown>
		>;
		return async (options) => {
			if (options.result.type === 'success') recoveryKey = key;
			await after?.(options);
			await syncKeys().catch(() => {});
		};
	};
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
	<form method="POST" action="?/createRecoveryKey" use:enhance={create}>
		<Block>
			<p class="mb-3 text-sm text-muted">{m.recovery_replace_hint()}</p>
			<SubmitButton pending={submission.pending} tonal>{m.recovery_create()}</SubmitButton>
		</Block>
	</form>
{/if}

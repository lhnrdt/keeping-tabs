<script lang="ts">
	// Enter a recovery key to be yourself again on this device (A-16).
	import { enhance, type SubmitFunction } from '$app/forms';
	import { openVaultWithRecovery } from '#lib/crypto/vault.ts';
	import { Block } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { error, restored }: { error?: ErrorCode; restored?: boolean } = $props();

	const submission = new Submission();
</script>

{#if restored}
	<Block class="tone-positive" role="status">{m.restore_done()}</Block>
{:else}
	<form
		method="POST"
		action="?/restore"
		use:enhance={(input) => {
			const typed = String(input.formData.get('recoveryKey') ?? '');
			const after = submission.enhance(input) as Exclude<
				ReturnType<SubmitFunction>,
				Promise<unknown>
			>;
			return async (options) => {
				await after?.(options);
				// Your groups' keys come back with it (#110)
				if (options.result.type === 'success') await openVaultWithRecovery(typed).catch(() => {});
			};
		}}
	>
		<div class="page-section mx-4 my-4">
			<Field
				label={m.field_recovery_key()}
				name="recoveryKey"
				required
				autocomplete="off"
				autocapitalize="characters"
				spellcheck="false"
			/>
		</div>
		<FormError {error} />
		<Block>
			<SubmitButton pending={submission.pending}>{m.restore_button()}</SubmitButton>
		</Block>
	</form>
{/if}

<script lang="ts">
	// A Konsta dialog around one form action; closes itself when the action succeeds.
	import { enhance } from '$app/forms';
	import { Dialog, DialogButton } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import ActorInput from './ActorInput.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		opened: boolean;
		title: string;
		/** Form action URL, see tabAction() */
		action: string;
		submitLabel: string;
		destructive?: boolean;
		onClose: () => void;
		children?: Snippet;
	};

	let {
		opened,
		title: heading,
		action,
		submitLabel,
		destructive = false,
		onClose,
		children
	}: Props = $props();

	const formId = $props.id();
	const submission = new Submission((result) => {
		if (result.type === 'success' || result.type === 'redirect') onClose();
	});
</script>

<Dialog {opened} onBackdropClick={onClose} role="dialog" aria-modal="true" aria-label={heading}>
	<!-- Konsta 5.5.0's Dialog crashes on string titles (missing printText import), so pass a snippet -->
	{#snippet title()}{heading}{/snippet}
	<form id={formId} method="POST" {action} use:enhance={submission.enhance}>
		<ActorInput />
		{@render children?.()}
	</form>

	{#snippet buttons()}
		<DialogButton type="button" onclick={onClose}>{m.cancel()}</DialogButton>
		<DialogButton
			type="submit"
			form={formId}
			strong
			disabled={submission.pending}
			class={destructive ? 'text-red-600 dark:text-red-400' : ''}
		>
			{submitLabel}
		</DialogButton>
	{/snippet}
</Dialog>

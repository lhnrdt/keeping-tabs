<script lang="ts">
	// A Konsta dialog around a form action (plus an optional second one, e.g. a destructive
	// alternative); closes itself when the action succeeds.
	import { enhance } from '$app/forms';
	import { Dialog, DialogButton } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		opened: boolean;
		title: string;
		/** Form action URL, see tabAction() */
		action: string;
		submitLabel: string;
		destructive?: boolean;
		/** Another action on the same form, shown as an extra button */
		secondary?: { label: string; action: string };
		onClose: () => void;
		children?: Snippet;
	};

	let {
		opened,
		title: heading,
		action,
		submitLabel,
		destructive = false,
		secondary,
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
		{@render children?.()}
	</form>

	{#snippet buttons()}
		<DialogButton type="button" onclick={onClose}>{m.cancel()}</DialogButton>
		{#if secondary}
			<DialogButton
				type="submit"
				form={formId}
				formaction={secondary.action}
				formnovalidate
				disabled={submission.pending}
				class="tone-destructive"
			>
				{secondary.label}
			</DialogButton>
		{/if}
		<DialogButton
			type="submit"
			form={formId}
			strong
			disabled={submission.pending}
			class={destructive ? 'tone-destructive' : ''}
		>
			{submitLabel}
		</DialogButton>
	{/snippet}
</Dialog>

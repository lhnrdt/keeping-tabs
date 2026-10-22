<script lang="ts">
	// "You're Ben in this group": with "Not you? Switch" while you haven't taken part yet,
	// and a way to your devices and recovery.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Actions, ActionsButton, ActionsGroup, ActionsLabel } from 'konsta/svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { token, error }: { token: string; error?: ErrorCode } = $props();

	const identity = useIdentity();
	const close = () => (identity.showing = false);
	const submission = new Submission((result) => {
		if (result.type === 'success') close();
	});
</script>

<Actions
	opened={identity.showing && !!identity.me}
	onBackdropClick={close}
	role="dialog"
	aria-modal="true"
	aria-label={m.you_are({ name: identity.me?.name ?? '' })}
>
	<form
		method="POST"
		action={`${resolve('/g/[token]', { token })}?/stepBack`}
		use:enhance={submission.enhance}
	>
		<ActionsGroup>
			<ActionsLabel>
				<strong>{m.you_are({ name: identity.me?.name ?? '' })}</strong>
				{identity.canStepBack ? m.not_you_hint() : m.you_for_good()}
			</ActionsLabel>
			{#if identity.canStepBack}
				<ActionsButton type="submit" disabled={submission.pending}>{m.not_you()}</ActionsButton>
			{/if}
			<ActionsButton href={resolve('/device')} onclick={close}>{m.identity_title()}</ActionsButton>
		</ActionsGroup>
		<FormError {error} />
		<ActionsGroup>
			<ActionsButton type="button" bold onclick={close}>{m.close()}</ActionsButton>
		</ActionsGroup>
	</form>
</Actions>

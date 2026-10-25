<script lang="ts">
	// Your avatar in a group (#156): the same menu as everywhere, plus "You're Ben in this
	// group" and "Not you?" while you haven't taken part yet.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from 'konsta/svelte';
	import FormError from '#lib/components/FormError.svelte';
	import YouMenu from '#lib/components/YouMenu.svelte';
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

{#if identity.me}
	<YouMenu
		opened={identity.showing}
		onClose={close}
		me={identity.me}
		heading={m.you_are({ name: identity.me.name })}
		hint={identity.canStepBack ? m.not_you_hint() : m.you_for_good()}
	>
		{#if identity.canStepBack}
			<form
				method="POST"
				action={`${resolve('/g/[token]', { token })}?/stepBack`}
				use:enhance={submission.enhance}
			>
				<Button large rounded clear type="submit" disabled={submission.pending}>
					{m.not_you()}
				</Button>
			</form>
		{/if}
		<FormError {error} />
	</YouMenu>
{/if}

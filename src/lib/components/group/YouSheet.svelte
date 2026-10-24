<script lang="ts">
	// "You're Ben in this group": a bottom sheet explaining who you are here, with "Not you?
	// Switch" while you haven't taken part yet, and a way to your devices and recovery.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button, Sheet } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
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
	const heading = $derived(m.you_are({ name: identity.me?.name ?? '' }));
</script>

<Sheet
	class="rounded-t-3xl"
	opened={identity.showing && !!identity.me}
	onBackdropClick={close}
	role="dialog"
	aria-modal="true"
	aria-label={heading}
>
	<div class="mx-auto max-w-app px-5 pt-3 pb-[calc(var(--k-safe-area-bottom,0px)+1.25rem)]">
		<div class="mx-auto mb-5 h-1.5 w-10 rounded-full bg-ink-muted/30" aria-hidden="true"></div>
		{#if identity.me}
			<div class="flex items-center gap-3">
				<Avatar id={identity.me.avatarId} name={identity.me.name} size="lg" />
				<h2 class="font-display text-2xl leading-tight font-semibold">{heading}</h2>
			</div>
		{/if}
		<p class="mt-3 text-sm text-muted">
			{identity.canStepBack ? m.not_you_hint() : m.you_for_good()}
		</p>

		<form
			class="mt-6 flex flex-col gap-2"
			method="POST"
			action={`${resolve('/g/[token]', { token })}?/stepBack`}
			use:enhance={submission.enhance}
		>
			<a
				href={resolve('/you/devices')}
				onclick={close}
				class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-surface-muted px-4 font-medium text-accent active:opacity-70 dark:bg-surface-muted-night dark:text-accent-night"
			>
				<Icon name="passkey" size={20} />
				{m.identity_title()}
			</a>
			{#if identity.canStepBack}
				<Button large rounded clear type="submit" disabled={submission.pending}>
					{m.not_you()}
				</Button>
			{/if}
			<Button large rounded clear type="button" onclick={close}>{m.close()}</Button>
			<FormError {error} />
		</form>
	</div>
</Sheet>

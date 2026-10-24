<script lang="ts">
	// What your avatar opens, everywhere (#156): you, your profile, devices & recovery. A group
	// adds its own lines and actions (`children`), e.g. "Not you?".
	import { resolve } from '$app/paths';
	import { Button, Sheet } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		opened: boolean;
		onClose: () => void;
		me: { avatarId: string; name: string; avatar: string | null };
		/** Defaults to your name */
		heading?: string;
		hint?: string;
		children?: Snippet;
	};

	let { opened, onClose, me, heading, hint, children }: Props = $props();

	const title = $derived(heading ?? me.name);
	const link =
		'flex min-h-12 items-center justify-center gap-2 rounded-full bg-surface-muted px-4 font-medium text-accent active:opacity-70 dark:bg-surface-muted-night dark:text-accent-night';
</script>

<Sheet
	class="rounded-t-3xl"
	{opened}
	onBackdropClick={onClose}
	inert={!opened}
	role="dialog"
	aria-modal="true"
	aria-label={title}
>
	<div class="mx-auto max-w-app px-5 pt-3 pb-[calc(var(--k-safe-area-bottom,0px)+1.25rem)]">
		<div class="mx-auto mb-5 h-1.5 w-10 rounded-full bg-ink-muted/30" aria-hidden="true"></div>
		<div class="flex items-center gap-3">
			<Avatar id={me.avatarId} name={me.name} avatar={me.avatar} size="lg" />
			<h2 class="font-display text-2xl leading-tight font-semibold">{title}</h2>
		</div>
		{#if hint}<p class="mt-3 text-sm text-muted">{hint}</p>{/if}

		<div class="mt-6 flex flex-col gap-2">
			<a href={resolve('/you')} onclick={onClose} class={link}>
				<Icon name="identity" size={20} />
				{m.you_title()}
			</a>
			<a href={resolve('/you/devices')} onclick={onClose} class={link}>
				<Icon name="passkey" size={20} />
				{m.identity_title()}
			</a>
			{@render children?.()}
			<Button large rounded clear type="button" onclick={onClose}>{m.close()}</Button>
		</div>
	</div>
</Sheet>

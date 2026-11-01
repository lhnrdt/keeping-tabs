<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, Toast } from 'konsta/svelte';
	import EncryptedNote from '#lib/components/EncryptedNote.svelte';
	import LinkField from '#lib/components/LinkField.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import FormDialog from './FormDialog.svelte';
	import { keyFor, linkWithKey } from '#lib/crypto/keyring.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { shareOrCopy } from '#lib/share.ts';

	let { token, groupName }: { token: string; groupName: string } = $props();

	const plainUrl = $derived(new URL(resolve('/g/[token]', { token }), page.url.origin).href);
	// An encrypted group's link carries its key (#110), in the part browsers don't send
	let key = $state<string>();
	$effect(() => {
		const keyId = page.data.group?.keyId;
		if (keyId) void keyFor(keyId).then((found) => (key = found));
	});
	const shareUrl = $derived(key ? linkWithKey(plainUrl, key) : plainUrl);
	let copied = $state(false);
	let confirmingRegenerate = $state(false);

	async function share() {
		if ((await shareOrCopy(groupName, shareUrl)) !== 'copied') return;
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex flex-col gap-3 px-4 pb-4">
	<p class="pt-1 text-sm text-muted">{m.share_hint()}</p>
	<LinkField link={shareUrl} label={m.share_title()} />
	<Button large rounded type="button" class="gap-2" onclick={share}>
		<Icon name="share" />
		{m.share_button()}
	</Button>
	<!-- With a key in the link, a new one means sealing everything anew: that has its own page -->
	{#if page.data.group?.keyId}
		<a
			href={resolve('/g/[token]/encrypt', { token })}
			class="flex min-h-11 items-center justify-center gap-2 text-sm font-medium tone-destructive"
		>
			<Icon name="newLink" size={18} />
			{m.regenerate_link()}
		</a>
	{:else}
		<button
			type="button"
			class="flex min-h-11 items-center justify-center gap-2 text-sm font-medium tone-destructive"
			onclick={() => (confirmingRegenerate = true)}
		>
			<Icon name="newLink" size={18} />
			{m.regenerate_link()}
		</button>
	{/if}
	<EncryptedNote />
</div>

<Toast position="center" opened={copied}>{m.share_copied()}</Toast>

<FormDialog
	opened={confirmingRegenerate}
	title={m.regenerate_link()}
	action={tabAction('regenerateLink', 'group')}
	submitLabel={m.regenerate_link()}
	destructive
	onClose={() => (confirmingRegenerate = false)}
>
	<p>{m.regenerate_confirm()}</p>
	<p class="mt-2 text-sm text-muted">{m.regenerate_hint()}</p>
</FormDialog>

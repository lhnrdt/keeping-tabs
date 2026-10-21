<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Block, Button, List, ListButton, ListItem, Toast } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import FormDialog from './FormDialog.svelte';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { token, groupName }: { token: string; groupName: string } = $props();

	const shareUrl = $derived(new URL(resolve('/g/[token]', { token }), page.url.origin).href);
	let copied = $state(false);
	let confirmingRegenerate = $state(false);

	/** System share sheet where available (G-4), otherwise copy to the clipboard. */
	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({ title: groupName, url: shareUrl });
			} catch {
				// Dismissed by the user
			}
			return;
		}
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Block class="!mb-2">
	<p class="text-sm opacity-70">{m.share_hint()}</p>
</Block>
<List strong inset>
	<ListItem title={shareUrl} titleWrapClass="truncate select-all" aria-label={m.share_title()} />
	<ListButton type="button" class="tone-destructive" onclick={() => (confirmingRegenerate = true)}>
		<Icon name="newLink" />
		{m.regenerate_link()}
	</ListButton>
</List>
<Block>
	<Button large rounded type="button" class="gap-2" onclick={share}>
		<Icon name="share" />
		{m.share_button()}
	</Button>
</Block>

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
	<p class="mt-2 text-sm opacity-70">{m.regenerate_hint()}</p>
</FormDialog>

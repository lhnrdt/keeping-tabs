<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Block, Button, List, ListButton, ListItem, Toast } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import FormDialog from './FormDialog.svelte';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { shareOrCopy } from '#lib/share.ts';

	let { token, groupName }: { token: string; groupName: string } = $props();

	const shareUrl = $derived(new URL(resolve('/g/[token]', { token }), page.url.origin).href);
	let copied = $state(false);
	let confirmingRegenerate = $state(false);

	async function share() {
		if ((await shareOrCopy(groupName, shareUrl)) !== 'copied') return;
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Block class="!mb-2">
	<p class="text-sm text-muted">{m.share_hint()}</p>
</Block>
<List strong inset>
	<ListItem title={shareUrl} titleWrapClass="truncate select-all" aria-label={m.share_title()} />
	<ListButton
		type="button"
		class="[&_button]:tone-destructive"
		onclick={() => (confirmingRegenerate = true)}
	>
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
	<p class="mt-2 text-sm text-muted">{m.regenerate_hint()}</p>
</FormDialog>

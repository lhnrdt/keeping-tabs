<script lang="ts">
	// Creates a one-time link for another device and offers to share or copy it (A-14).
	import { enhance } from '$app/forms';
	import { Block, Button, List, ListItem, Toast } from 'konsta/svelte';
	import CopyButton from '#lib/components/CopyButton.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { shareOrCopy } from '#lib/share.ts';

	let { link }: { link?: string } = $props();

	const submission = new Submission();
	let copied = $state(false);

	async function share(url: string) {
		if ((await shareOrCopy(m.device_title(), url)) !== 'copied') return;
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

{#if link}
	<List strong inset>
		<ListItem
			title={link}
			titleWrapClass="truncate select-all"
			aria-label={m.device_link_label()}
		/>
	</List>
	<Block class="grid grid-cols-2 gap-3">
		<Button large rounded type="button" class="gap-2" onclick={() => share(link)}>
			<Icon name="share" />
			{m.share_button()}
		</Button>
		<CopyButton text={link} label={m.copy_link()} />
	</Block>
	<Toast position="center" opened={copied}>{m.share_copied()}</Toast>
{:else}
	<form method="POST" action="?/createLink" use:enhance={submission.enhance}>
		<Block>
			<SubmitButton pending={submission.pending} tonal>{m.device_create_link()}</SubmitButton>
		</Block>
	</form>
{/if}

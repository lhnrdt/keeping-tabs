<script lang="ts">
	// Copies something meant to be passed on (#124): a link, a key. Says "Copied" for a moment
	// (also to screen readers); where the clipboard isn't available, the text is offered in a
	// prompt to copy by hand.
	import { Button } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { copyText } from '#lib/clipboard.ts';
	import { calmPop } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		text: string;
		label: string;
		/** Quieter, next to a main action */
		tonal?: boolean;
		/** Just a small icon, to sit inside a field */
		iconOnly?: boolean;
	};

	let { text, label, tonal = true, iconOnly = false }: Props = $props();

	let copied = $state(false);

	async function copy() {
		if (!(await copyText(text))) {
			window.prompt(label, text);
			return;
		}
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

{#if iconOnly}
	<button
		type="button"
		class="grid size-11 flex-none place-items-center text-accent transition-transform duration-150 active:scale-90 dark:text-accent-night"
		onclick={copy}
	>
		{#key copied}
			<span class="grid place-items-center" in:calmPop>
				<Icon name={copied ? 'check' : 'copy'} size={18} />
			</span>
		{/key}
		<span class="sr-only" aria-live="polite">{copied ? m.copied() : label}</span>
	</button>
{:else}
	<!-- Ink text: the tonal accent on its tint is just under 4.5:1 at this size -->
	<Button
		large
		rounded
		{tonal}
		type="button"
		class="gap-2 {tonal ? '!text-ink dark:!text-ink-night' : ''}"
		onclick={copy}
	>
		<Icon name={copied ? 'check' : 'copy'} />
		<span aria-live="polite">{copied ? m.copied() : label}</span>
	</Button>
{/if}

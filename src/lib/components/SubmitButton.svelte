<script lang="ts">
	import { Button, Preloader } from 'konsta/svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		pending?: boolean;
		form?: string;
		/** Quieter style for secondary actions */
		tonal?: boolean;
		/** Not ready to be sent yet, e.g. before the page has read what it needs */
		disabled?: boolean;
		children: Snippet;
	};

	let { pending = false, form, tonal = false, disabled = false, children }: Props = $props();
</script>

<Button
	large
	rounded
	{tonal}
	type="submit"
	{form}
	disabled={pending || disabled}
	aria-busy={pending}
>
	{#if pending}
		<Preloader class="mr-2 h-5 w-5" />
	{/if}
	{@render children()}
</Button>

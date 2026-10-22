<script lang="ts">
	import { Button, Preloader } from 'konsta/svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		pending?: boolean;
		form?: string;
		/** Quieter style for secondary actions */
		tonal?: boolean;
		children: Snippet;
	};

	let { pending = false, form, tonal = false, children }: Props = $props();
</script>

<Button large rounded {tonal} type="submit" {form} disabled={pending} aria-busy={pending}>
	{#if pending}
		<Preloader class="mr-2 h-5 w-5" />
	{/if}
	{@render children()}
</Button>

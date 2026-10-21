<script lang="ts">
	import { Button, Preloader } from 'konsta/svelte';
	import type { Snippet } from 'svelte';

	type Props = { pending?: boolean; form?: string; children: Snippet };

	let { pending = false, form, children }: Props = $props();
</script>

<Button large rounded type="submit" {form} disabled={pending} aria-busy={pending}>
	{#if pending}
		<Preloader class="mr-2 h-5 w-5" />
	{/if}
	{@render children()}
</Button>

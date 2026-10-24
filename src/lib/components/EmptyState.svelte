<script lang="ts">
	// A quiet illustration with one line of text, for empty lists and calm moments.
	import Hills from './illustrations/Hills.svelte';
	import Plant from './illustrations/Plant.svelte';

	const illustrations = { plant: Plant, hills: Hills };

	type Props = { illustration: keyof typeof illustrations; text: string; role?: 'status' };

	let { illustration, text, role }: Props = $props();

	const Illustration = $derived(illustrations[illustration]);
</script>

<div class="flex flex-col items-center gap-3 px-4 py-8 text-center" {role}>
	<span class="text-accent-soft dark:text-accent-night"><Illustration /></span>
	<p class="max-w-xs text-muted">{text}</p>
</div>

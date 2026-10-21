<script lang="ts">
	// Konsta's ListInput renders its label as a <div>; this puts a real <label for>
	// in it so the field is announced by screen readers (N-7).
	import { ListInput } from 'konsta/svelte';
	import type { SvelteComponent } from 'svelte';

	// Konsta declares its components as legacy classes
	type PropsOf<T> = T extends abstract new (...args: never[]) => SvelteComponent<infer P>
		? P
		: never;
	type Props = Omit<PropsOf<typeof ListInput>, 'label' | 'inputId'> & { label: string };

	let { label, value = $bindable(), ...rest }: Props = $props();
	const id = $props.id();
</script>

{#snippet labelElement()}
	<label for={id}>{label}</label>
{/snippet}

<ListInput label={labelElement} inputId={id} bind:value {...rest} />

<script lang="ts">
	// Choose what a group is for (SP-18).
	import { kindIcons, kindLabels } from '#lib/group/kind-style.ts';
	import { GROUP_KINDS } from '#lib/group/kinds.ts';
	import { m } from '#lib/paraglide/messages.js';
	import TilePicker from './TilePicker.svelte';

	/** value: the chosen kind, as submitted */
	let { value }: { value: string } = $props();

	const options = GROUP_KINDS.map((kind) => ({
		value: kind,
		label: kindLabels[kind](),
		icon: kindIcons[kind]
	}));
</script>

<TilePicker name="kind" legend={m.field_group_kind()} {value} {options} />

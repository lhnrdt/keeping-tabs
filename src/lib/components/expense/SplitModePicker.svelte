<script lang="ts">
	// How the expense is split: a segmented row of radio buttons, so it works without JS too.
	import SegmentedPicker from '#lib/components/pickers/SegmentedPicker.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { SPLIT_MODES, type SplitMode } from '#lib/split/modes.ts';

	let { mode = $bindable() }: { mode: SplitMode } = $props();

	const labels: Record<SplitMode, () => string> = {
		equal: m.split_equal,
		exact: m.split_exact,
		percent: m.split_percent,
		shares: m.split_shares,
		adjust: m.split_adjust
	};
	const options = SPLIT_MODES.map((option) => ({ value: option, label: labels[option]() }));
</script>

<SegmentedPicker name="splitMode" legend={m.field_split()} {options} bind:value={mode} />

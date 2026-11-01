<script lang="ts">
	// A link to pass on: read-only in a field like any other, with a small copy button inside it.
	// Too long to fit, it's cut off rather than scrolled sideways; the button is how to take it.
	import CopyButton from './CopyButton.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { link, label }: { link: string; label: string } = $props();
</script>

<div class="field-well">
	<input
		readonly
		value={link}
		aria-label={label}
		class="pointer-events-none truncate"
		onfocus={(event) => event.currentTarget.select()}
	/>
	<CopyButton text={link} label={m.copy_link()} iconOnly />
</div>

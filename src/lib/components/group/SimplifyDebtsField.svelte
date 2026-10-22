<script lang="ts">
	// The group's "simplify debts" setting (B-6) as a checkbox with what it means.
	import { Checkbox, ListItem } from 'konsta/svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { checked }: { checked: boolean } = $props();
</script>

<ListItem label title={m.field_simplify_debts()} text={m.simplify_debts_hint()}>
	{#snippet media()}
		<!-- Konsta hides the input with display:none; keep it reachable (N-7) -->
		<Checkbox
			class="[&>input]:sr-only [&>input]:block [&>input:focus-visible+i]:ring-2 [&>input:focus-visible+i]:ring-offset-2"
			component="div"
			name="simplifyDebts"
			{checked}
		/>
	{/snippet}
</ListItem>

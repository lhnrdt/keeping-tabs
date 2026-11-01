<script lang="ts">
	// The group's "simplify debts" setting (B-6) as a checkbox with what it means.
	import { m } from '#lib/paraglide/messages.js';

	let { checked }: { checked: boolean } = $props();
</script>

<label class="flex cursor-pointer items-start gap-3">
	<input
		type="checkbox"
		name="simplifyDebts"
		class="mt-0.5 size-[18px] shrink-0 accent-accent dark:accent-accent-night"
		{checked}
	/>
	<span class="flex flex-col">
		<span class="text-sm font-medium">{m.field_simplify_debts()}</span>
		<span class="text-sm text-muted">{m.simplify_debts_hint()}</span>
	</span>
</label>

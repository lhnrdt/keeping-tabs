<script lang="ts">
	// A setting whose control isn't a single field: its label with room for "Saved" on that line,
	// the control, and anything below. Purely visual label: the control names itself.
	import type { Snippet } from 'svelte';
	import FormError from './FormError.svelte';
	import SavedHint from './SavedHint.svelte';
	import type { ErrorCode } from '#lib/errors.ts';

	type Props = { label: string; saved: boolean; error?: ErrorCode; children: Snippet };

	let { label, saved, error, children }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	<div class="flex min-h-5 items-center justify-between gap-2">
		<span class="field-label" aria-hidden="true">{label}</span>
		<SavedHint shown={saved} />
	</div>
	{@render children()}
	<FormError {error} />
</div>

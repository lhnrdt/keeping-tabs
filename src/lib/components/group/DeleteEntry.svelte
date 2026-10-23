<script lang="ts">
	// Delete button with confirmation for an expense or payment (action "?/delete").
	import ConfirmDelete from './ConfirmDelete.svelte';

	let { label, question }: { label: string; question: string } = $props();
</script>

<ConfirmDelete {label} action="?/delete" confirmLabel={label}>
	<p>{question}</p>
</ConfirmDelete>

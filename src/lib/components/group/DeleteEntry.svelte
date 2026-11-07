<script lang="ts">
	// Delete button with confirmation for an expense or payment (action "?/delete").
	import ConfirmDelete from './ConfirmDelete.svelte';

	let { label, question }: { label: string; question: string } = $props();
</script>

<!-- Deleting an expense tells the people in it (#267); a payment's deletion stays quiet -->
<ConfirmDelete {label} action="?/delete" announce="changed" confirmLabel={label}>
	<p>{question}</p>
</ConfirmDelete>

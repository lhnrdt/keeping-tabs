<script lang="ts">
	// Delete the identity behind this device (GDPR, #74): passkeys, device links, recovery key
	// and the link to your members, optionally with your name in groups. Groups and their
	// expenses stay for the others.
	import { Button, Checkbox, ListItem, List } from 'konsta/svelte';
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import { clearRecentGroups } from '#lib/device.ts';
	import { m } from '#lib/paraglide/messages.js';

	let confirming = $state(false);
</script>

<div class="mx-4">
	<Button
		large
		rounded
		tonal
		class="tone-destructive"
		type="button"
		onclick={() => (confirming = true)}
	>
		{m.delete_identity_button()}
	</Button>
</div>

<FormDialog
	opened={confirming}
	title={m.delete_identity_title()}
	action="?/deleteIdentity"
	submitLabel={m.delete_identity_confirm()}
	destructive
	onSubmit={clearRecentGroups}
	onClose={() => (confirming = false)}
>
	<p class="text-sm">{m.delete_identity_explain()}</p>
	<List nested class="-mx-4 mt-2 mb-0">
		<ListItem label title={m.delete_identity_anonymize()}>
			{#snippet media()}
				<!-- Konsta hides the input with display:none; keep it reachable (N-7) -->
				<Checkbox
					class="[&>input]:sr-only [&>input]:block [&>input:focus-visible+i]:ring-2 [&>input:focus-visible+i]:ring-offset-2"
					component="div"
					name="anonymize"
				/>
			{/snippet}
		</ListItem>
	</List>
</FormDialog>

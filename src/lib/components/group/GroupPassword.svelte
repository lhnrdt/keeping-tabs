<script lang="ts">
	// Set, change or remove the group's password (A-10): open to everyone in the group.
	import { enhance } from '$app/forms';
	import { List, ListButton, ListItem } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { calmSlide } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import FormDialog from './FormDialog.svelte';

	let { hasPassword, error }: { hasPassword: boolean; error?: ErrorCode } = $props();

	let editing = $state(false);
</script>

<List strong inset role="region" aria-label={m.field_group_password()}>
	<ListItem
		title={m.field_group_password()}
		after={hasPassword ? m.on() : m.off()}
		text={m.group_password_hint()}
	/>
	<ListButton type="button" onclick={() => (editing = true)}>
		<Icon name="passkey" />
		{hasPassword ? m.group_password_change() : m.group_password_set()}
	</ListButton>
</List>
{#if hasPassword}
	<form
		transition:calmSlide
		method="POST"
		action={tabAction('removePassword', 'group')}
		class="mx-4 -mt-4 mb-6"
		use:enhance
	>
		<button type="submit" class="min-h-11 text-sm font-medium tone-destructive"
			>{m.group_password_remove()}</button
		>
	</form>
{/if}

<FormDialog
	opened={editing}
	title={hasPassword ? m.group_password_change() : m.group_password_set()}
	action={tabAction('setPassword', 'group')}
	submitLabel={m.save()}
	onClose={() => (editing = false)}
>
	<List nested class="-mx-4 my-0">
		<Field
			label={m.field_group_password()}
			name="password"
			type="password"
			required
			minlength={LIMITS.groupPasswordMin}
			maxlength={LIMITS.groupPassword}
			autocomplete="new-password"
		/>
	</List>
	<p class="mt-2 text-sm text-muted">{m.group_password_dialog_hint()}</p>
	<FormError {error} />
</FormDialog>

<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const title = $derived(data.hasPassword ? m.group_password_change() : m.group_password_set());
</script>

<svelte:head>
	<title>{title} – {data.group.name}</title>
</svelte:head>

<AppPage
	{title}
	back={{
		href: groupTabUrl(resolve('/g/[token]', { token: data.group.shareToken }), 'group'),
		label: data.group.name
	}}
>
	<GroupForm error={form?.error} submitLabel={m.save()}>
		<div class="page-sections">
			<div class="page-section">
				<Field
					label={m.field_group_password()}
					name="password"
					type="password"
					required
					minlength={LIMITS.groupPasswordMin}
					maxlength={LIMITS.groupPassword}
					autocomplete="new-password"
				/>
				<p class="text-sm text-muted">{m.group_password_dialog_hint()}</p>
			</div>
		</div>
	</GroupForm>
	{#if data.hasPassword}
		<form method="POST" action="?/remove" class="px-4">
			<button type="submit" class="min-h-11 text-sm font-medium tone-destructive"
				>{m.group_password_remove()}</button
			>
		</form>
	{/if}
</AppPage>

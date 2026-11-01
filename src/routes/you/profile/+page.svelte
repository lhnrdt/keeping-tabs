<script lang="ts">
	// Who you are to the others: name, avatar and how to pay you. Saves as it changes; without
	// JavaScript, each has its own Save button.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import AvatarPicker from '#lib/components/pickers/AvatarPicker.svelte';
	import SavedHint from '#lib/components/SavedHint.svelte';
	import { parseAvatar } from '#lib/avatars.ts';
	import { SavedSetting } from '#lib/forms/saved-setting.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { tintFor } from '#lib/tints.ts';
	import { LIMITS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const setting = new SavedSetting();
	const submitOnChange = (event: Event & { currentTarget: HTMLFormElement }) =>
		event.currentTarget.requestSubmit();
	const errorFor = (name: string) => (form?.setting === name ? form.error : undefined);
</script>

<svelte:head>
	<title>{m.you_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.you_title()} back={{ href: resolve('/you'), label: m.settings_title() }}>
	{#if data.name}
		<div class="flex items-center gap-3 px-4 pt-4 pb-2">
			<Avatar id={data.personId ?? ''} name={data.name} avatar={data.avatar} />
			<p class="font-display text-2xl font-semibold">{data.name}</p>
		</div>
	{/if}

	<form
		method="POST"
		action="?/name"
		class="px-4 pt-2"
		use:enhance={setting.quietly}
		onchange={submitOnChange}
	>
		<PlainField label={m.field_your_name()}>
			{#snippet children(id)}
				<input
					{id}
					name="name"
					maxlength={LIMITS.memberName}
					autocomplete="given-name"
					placeholder={m.placeholder_name()}
					value={data.name}
				/>
			{/snippet}
			{#snippet below()}
				<p class="text-sm text-muted">{m.settings_name_hint()}</p>
			{/snippet}
		</PlainField>
		<SavedHint shown={setting.saved === 'name'} />
		<FormError error={errorFor('name')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

	<form
		method="POST"
		action="?/payment"
		class="px-4 pt-4"
		use:enhance={setting.quietly}
		onchange={submitOnChange}
	>
		<PlainField label={m.field_payment_details()}>
			{#snippet children(id)}
				<input
					{id}
					name="paymentDetails"
					maxlength={LIMITS.paymentDetails}
					autocomplete="off"
					placeholder={m.payment_details_placeholder()}
					value={data.paymentDetails}
				/>
			{/snippet}
			{#snippet below()}
				<p class="text-sm text-muted">{m.payment_details_hint()}</p>
			{/snippet}
		</PlainField>
		<SavedHint shown={setting.saved === 'payment'} />
		<FormError error={errorFor('payment')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

	<!-- Your avatar, shown wherever you appear (#61) -->
	<form method="POST" action="?/avatar" use:enhance={setting.quietly} onchange={submitOnChange}>
		<h2 class="field-label mx-4 mt-6 mb-2">{m.avatar_title()}</h2>
		<AvatarPicker
			id={data.personId ?? ''}
			name={data.name}
			value={parseAvatar(data.avatar) ?? { icon: null, tint: tintFor(data.personId ?? '') }}
		/>
		<SavedHint shown={setting.saved === 'avatar'} />
		<FormError error={errorFor('avatar')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>
</AppPage>

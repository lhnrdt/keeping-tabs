<script lang="ts">
	// Who you are to the others: name, avatar and how to pay you. Saves as it changes; without
	// JavaScript, each has its own Save button.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import AvatarPicker from '#lib/components/pickers/AvatarPicker.svelte';
	import SavedHint from '#lib/components/SavedHint.svelte';
	import SettingField from '#lib/components/SettingField.svelte';
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
	<div class="page-sections">
		<section class="page-section">
			<form method="POST" action="?/name" use:enhance={setting.quietly} onchange={submitOnChange}>
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
					{#snippet aside()}<SavedHint shown={setting.saved === 'name'} />{/snippet}
					{#snippet below()}
						<p class="text-sm text-muted">{m.settings_name_hint()}</p>
						<FormError error={errorFor('name')} />
					{/snippet}
				</PlainField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			<form
				method="POST"
				action="?/payment"
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
					{#snippet aside()}<SavedHint shown={setting.saved === 'payment'} />{/snippet}
					{#snippet below()}
						<p class="text-sm text-muted">{m.payment_details_hint()}</p>
						<FormError error={errorFor('payment')} />
					{/snippet}
				</PlainField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>
		</section>

		<!-- Your avatar, shown wherever you appear (#61) -->
		<form method="POST" action="?/avatar" use:enhance={setting.quietly} onchange={submitOnChange}>
			<SettingField
				label={m.avatar_title()}
				saved={setting.saved === 'avatar'}
				error={errorFor('avatar')}
			>
				<div class="-mx-4">
					<AvatarPicker
						id={data.personId ?? ''}
						name={data.name}
						value={parseAvatar(data.avatar) ?? { icon: null, tint: tintFor(data.personId ?? '') }}
					/>
				</div>
			</SettingField>
			<noscript><button type="submit">{m.save()}</button></noscript>
		</form>
	</div>
</AppPage>

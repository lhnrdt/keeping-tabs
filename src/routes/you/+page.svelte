<script lang="ts">
	// Settings: who you are and your access lead on to their own pages; quick choices are right
	// here and save as they change. Without JavaScript, each has its own Save button.
	import { onMount } from 'svelte';
	import { version } from '$app/env';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { CHANGELOG } from '#lib/changelog/entries.ts';
	import { visibleEntries } from '#lib/changelog/visible.ts';
	import AppPage from '#lib/components/AppPage.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import DeleteIdentity from '#lib/components/device/DeleteIdentity.svelte';
	import PushToggle from '#lib/components/device/PushToggle.svelte';
	import Fold from '#lib/components/Fold.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import AccentPicker, { accentLabels } from '#lib/components/pickers/AccentPicker.svelte';
	import SegmentedPicker from '#lib/components/pickers/SegmentedPicker.svelte';
	import SavedHint from '#lib/components/SavedHint.svelte';
	import SettingField from '#lib/components/SettingField.svelte';
	import SettingsRow from '#lib/components/SettingsRow.svelte';
	import { getSeenChangelog } from '#lib/device.ts';
	import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
	import { SavedSetting } from '#lib/forms/saved-setting.svelte.ts';
	import { currencyLabel } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, locales } from '#lib/paraglide/runtime.js';
	import {
		isAccent,
		isTheme,
		LOCALE_NAMES,
		THEMES,
		type Theme,
		type Units
	} from '#lib/settings.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const themeLabels: Record<Theme, () => string> = {
		system: m.theme_system,
		light: m.theme_light,
		dark: m.theme_dark
	};
	const localeOptions = locales.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] }));
	const themeOptions = THEMES.map((theme) => ({ value: theme, label: themeLabels[theme]() }));
	const unitOptions: { value: Units; label: string }[] = [
		{ value: 'metric', label: m.units_metric() },
		{ value: 'imperial', label: m.units_imperial() }
	];

	const setting = new SavedSetting();
	const submitOnChange = (event: Event & { currentTarget: HTMLFormElement }) =>
		event.currentTarget.requestSubmit();

	const theme = useTheme();
	function accentChanged(event: Event & { currentTarget: HTMLFormElement }) {
		const accent = new FormData(event.currentTarget).get('accent');
		if (isAccent(accent)) {
			window.applyAccent?.(accent);
			theme.id = accent;
		}
		event.currentTarget.requestSubmit();
	}
	function themeChanged(event: Event & { currentTarget: HTMLFormElement }) {
		const chosen = new FormData(event.currentTarget).get('theme');
		if (isTheme(chosen)) window.applyTheme?.(chosen);
		event.currentTarget.requestSubmit();
	}
	const errorFor = (name: string) => (form?.setting === name ? form.error : undefined);

	// A dot on What's new when there's a version this device hasn't read about (#212)
	let unread = $state(false);
	onMount(() => {
		const newest = visibleEntries(CHANGELOG, version)[0]?.version;
		unread = Boolean(newest) && getSeenChangelog() !== newest;
	});
</script>

<svelte:head>
	<title>{m.settings_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.settings_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<div class="page-sections">
		<SettingsRow
			href={resolve('/you/profile')}
			title={data.name || m.you_title()}
			value={data.name ? m.you_title() : undefined}
			icon={data.name ? undefined : 'identity'}
		>
			{#snippet media()}
				{#if data.name}
					<Avatar id={data.personId ?? ''} name={data.name} avatar={data.avatar} size="sm" />
				{/if}
			{/snippet}
		</SettingsRow>

		<section class="page-section">
			<h2 class="section-label">{m.settings_preferences()}</h2>

			<!-- A plain post: the page is served again, so the new language applies everywhere -->
			<form method="POST" action="?/language" onchange={submitOnChange}>
				<input type="hidden" name="next" value={resolve('/you')} />
				<SettingField label={m.settings_language()} saved={false}>
					<SegmentedPicker
						name="locale"
						legend={m.settings_language()}
						options={localeOptions}
						value={data.locale}
					/>
				</SettingField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			<form method="POST" action="?/theme" use:enhance={setting.quietly} onchange={themeChanged}>
				<SettingField
					label={m.settings_theme()}
					saved={setting.saved === 'theme'}
					error={errorFor('theme')}
				>
					<SegmentedPicker
						name="theme"
						legend={m.settings_theme()}
						options={themeOptions}
						value={data.theme}
					/>
				</SettingField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			<form method="POST" action="?/accent" use:enhance={setting.quietly} onchange={accentChanged}>
				<SettingField
					label={m.settings_accent()}
					saved={setting.saved === 'accent'}
					error={errorFor('accent')}
				>
					<!-- Folded: nine tiles would outweigh everything else here -->
					<Fold plain title={accentLabels[data.accent]()}>
						<AccentPicker value={data.accent} />
					</Fold>
				</SettingField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			<form method="POST" action="?/units" use:enhance={setting.andShown} onchange={submitOnChange}>
				<SettingField
					label={m.settings_units()}
					saved={setting.saved === 'units'}
					error={errorFor('units')}
				>
					<SegmentedPicker
						name="units"
						legend={m.settings_units()}
						options={unitOptions}
						value={data.units}
					/>
				</SettingField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			<form
				method="POST"
				action="?/displayCurrency"
				use:enhance={setting.andShown}
				onchange={submitOnChange}
			>
				<PlainField label={m.settings_display_currency()} arrow>
					{#snippet children(id)}
						<select {id} name="displayCurrency" value={data.displayCurrency ?? ''}>
							<option value="">{m.settings_display_currency_none()}</option>
							{#each RATE_CURRENCIES as code (code)}
								<option value={code}>{currencyLabel(code, getLocale())}</option>
							{/each}
						</select>
					{/snippet}
					{#snippet aside()}<SavedHint shown={setting.saved === 'displayCurrency'} />{/snippet}
					{#snippet below()}
						<p class="text-sm text-muted">{m.settings_display_currency_hint()}</p>
						<FormError error={errorFor('displayCurrency')} />
					{/snippet}
				</PlainField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			{#if data.pushPublicKey}
				<PushToggle publicKey={data.pushPublicKey} />
			{/if}
		</section>

		<section class="page-section">
			<h2 class="section-label">{m.settings_access()}</h2>
			<div class="flex flex-col gap-2">
				<SettingsRow
					href={resolve('/you/devices')}
					title={m.devices_title()}
					icon="phone"
					value={data.deviceCount ? String(data.deviceCount) : undefined}
				/>
				<SettingsRow
					href={resolve('/you/backup')}
					title={m.backup_title()}
					icon="passkey"
					value={data.backedUp ? `✓ ${m.backup_saved()}` : m.backup_not_set_up()}
				/>
			</div>
		</section>

		<section class="page-section">
			<h2 class="section-label">{m.settings_about()}</h2>
			<SettingsRow href={resolve('/you/whats-new')} title={m.whats_new_title()} icon="sparkles">
				{#snippet after()}
					{#if unread}
						<!-- Something new since this device last looked (#212) -->
						<span class="h-2.5 w-2.5 rounded-full bg-accent dark:bg-accent-night"></span>
						<span class="sr-only">{m.whats_new_unread()}</span>
					{/if}
				{/snippet}
			</SettingsRow>
		</section>

		<!-- Removing you entirely, at the very end and in red (#151) -->
		<section class="page-section">
			<h2 class="section-label">{m.delete_identity_title()}</h2>
			<p class="text-sm text-muted">{m.delete_identity_intro()}</p>
			<DeleteIdentity />
		</section>
	</div>
</AppPage>

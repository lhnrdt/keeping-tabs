<script lang="ts">
	// Settings: who you are and your access lead on to their own pages; quick choices are right
	// here and save as they change. Without JavaScript, each has its own Save button.
	import InstallRow from '#lib/components/install/InstallRow.svelte';
	import { applyLook } from '#lib/themes/apply-look.ts';
	import { onMount } from 'svelte';
	import { version } from '$app/env';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { CHANGELOG } from '#lib/changelog/entries.ts';
	import { visibleEntries } from '#lib/changelog/visible.ts';
	import AppPage from '#lib/components/AppPage.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import DeleteIdentity from '#lib/components/device/DeleteIdentity.svelte';
	import LogOut from '#lib/components/device/LogOut.svelte';
	import PushToggle from '#lib/components/device/PushToggle.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import ColorsPicker from '#lib/components/pickers/ColorsPicker.svelte';
	import SceneryPicker from '#lib/components/pickers/SceneryPicker.svelte';
	import SegmentedPicker from '#lib/components/pickers/SegmentedPicker.svelte';
	import SavedHint from '#lib/components/SavedHint.svelte';
	import SettingField from '#lib/components/SettingField.svelte';
	import SettingsRow from '#lib/components/SettingsRow.svelte';
	import { getSeenChangelog } from '#lib/device.ts';
	import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
	import { SavedSetting } from '#lib/forms/saved-setting.svelte.ts';
	import { currencyLabel } from '#lib/money.ts';
	import { reportUrl } from '#lib/project.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, locales } from '#lib/paraglide/runtime.js';
	import {
		isColors,
		isScenery,
		isTheme,
		LOCALE_NAMES,
		THEMES,
		type Theme,
		type Units
	} from '#lib/settings.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';
	import { localDate, lookOn } from '#lib/themes/look.ts';
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
	// The scenery and colours change at once, worked out for today here (#332)
	let scenery = $derived(data.scenery);
	let colors = $derived(data.colors);
	const today = $derived(lookOn(scenery, colors, localDate()));
	function lookChanged(event: Event & { currentTarget: HTMLFormElement }) {
		const form = new FormData(event.currentTarget);
		const chosenScenery = form.get('scenery');
		const chosenColors = form.get('colors');
		if (isScenery(chosenScenery)) scenery = chosenScenery;
		if (isColors(chosenColors)) colors = chosenColors;
		applyLook(today);
		theme.id = today.scenery;
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

			<form method="POST" action="?/scenery" use:enhance={setting.quietly} onchange={lookChanged}>
				<SettingField
					label={m.settings_scenery()}
					saved={setting.saved === 'scenery'}
					error={errorFor('scenery')}
				>
					<SceneryPicker value={scenery} />
				</SettingField>
				<noscript><button type="submit">{m.save()}</button></noscript>
			</form>

			<form method="POST" action="?/colors" use:enhance={setting.quietly} onchange={lookChanged}>
				<SettingField
					label={m.settings_colors()}
					saved={setting.saved === 'colors'}
					error={errorFor('colors')}
				>
					<ColorsPicker value={colors} scenery={today.scenery} />
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
		</section>

		<!-- Also where it can't be used: then shown as off, saying why -->
		<section class="page-section">
			<h2 class="section-label">{m.push_title()}</h2>
			<PushToggle publicKey={data.pushPublicKey ?? null} muted={data.pushMuted} />
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
				<InstallRow />
			</div>
		</section>

		<section class="page-section">
			<h2 class="section-label">{m.settings_about()}</h2>
			<SettingsRow href={resolve('/how-it-works')} title={m.how_title()} icon="help" />
			<!-- eslint-disable svelte/no-navigation-without-resolve -- another site -->
			<a
				href={reportUrl(version)}
				target="_blank"
				rel="noopener"
				class="field-well min-h-14 gap-3 px-3.5 active:opacity-70"
			>
				<span class="flex-none opacity-65"><Icon name="report" size={20} /></span>
				<span class="min-w-0 flex-1 font-medium">{m.report_problem()}</span>
				<span class="flex-none text-sm text-muted">{m.report_problem_where()}</span>
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
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

		{#if data.personId}
			<!-- Only this device, before removing you entirely -->
			<section class="page-section">
				<h2 class="section-label">{m.log_out_title()}</h2>
				<p class="text-sm text-muted">{m.log_out_intro()}</p>
				<LogOut onlyWayIn={data.deviceCount <= 1 && !data.backedUp} />
			</section>
		{/if}

		<!-- Removing you entirely, at the very end and in red (#151) -->
		<section class="page-section">
			<h2 class="section-label">{m.delete_identity_title()}</h2>
			<p class="text-sm text-muted">{m.delete_identity_intro()}</p>
			<DeleteIdentity />
		</section>
	</div>
</AppPage>

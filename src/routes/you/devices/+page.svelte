<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Fold from '#lib/components/Fold.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import DeviceList from '#lib/components/device/DeviceList.svelte';
	import DeviceLinkCreator from '#lib/components/device/DeviceLinkCreator.svelte';
	import PasskeyRestore from '#lib/components/device/PasskeyRestore.svelte';
	import RestoreForm from '#lib/components/device/RestoreForm.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.devices_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.devices_title()} back={{ href: resolve('/you'), label: m.settings_title() }}>
	{#if data.hasIdentity}
		<!-- 1. Your devices (#126), and adding one -->
		<DeviceList devices={data.devices} />
		<FormError error={form && 'error' in form && !('restored' in form) ? form.error : undefined} />
		<Fold title={m.device_title()} open={Boolean(form && 'link' in form)}>
			<Block class="!my-2"><p class="text-sm text-muted">{m.device_intro()}</p></Block>
			<DeviceLinkCreator link={form && 'link' in form ? form.link : undefined} />
		</Fold>
	{/if}

	<!-- 2. Coming from another device: open while this one isn't you yet -->
	<div class="mt-6">
		<Fold
			title={m.restore_from_other()}
			open={!data.hasIdentity || Boolean(form && 'restored' in form)}
		>
			<Block class="!my-2"><p class="text-sm text-muted">{m.restore_intro()}</p></Block>
			<PasskeyRestore />
			<RestoreForm
				error={form && 'error' in form && !('link' in form) ? form.error : undefined}
				restored={form && 'restored' in form ? form.restored : undefined}
			/>
		</Fold>
	</div>
</AppPage>

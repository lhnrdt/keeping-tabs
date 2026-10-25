<script lang="ts">
	// Your devices (#126): which browsers are you, when each was last used, and removing one
	// you don't use anymore (red, asks first). This device is marked and can't remove itself.
	import { List, ListItem } from 'konsta/svelte';
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Device = {
		id: string;
		label: string | null;
		current: boolean;
		createdAt: Date;
		lastSeenAt: Date | null;
	};

	let { devices }: { devices: Device[] } = $props();

	let removing = $state<Device | null>(null);
	const date = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' });
	const nameOf = (device: Device) => device.label ?? m.device_unknown();
</script>

<List strong inset role="region" aria-label={m.devices_title()}>
	{#each devices as device (device.id)}
		<ListItem
			title={nameOf(device)}
			subtitle={device.current
				? m.device_this()
				: m.device_last_used({ date: date.format(device.lastSeenAt ?? device.createdAt) })}
		>
			{#snippet media()}
				<Icon name={/Android|iPhone|iPad/.test(device.label ?? '') ? 'phone' : 'computer'} />
			{/snippet}
			{#snippet after()}
				{#if !device.current}
					<button
						type="button"
						class="rounded-full px-3 py-1.5 text-sm font-medium tone-destructive focus-visible:ring-2"
						onclick={() => (removing = device)}
					>
						{m.device_remove()}
					</button>
				{/if}
			{/snippet}
		</ListItem>
	{/each}
</List>

<FormDialog
	opened={removing !== null}
	title={m.device_remove_title({ name: removing ? nameOf(removing) : '' })}
	action="?/removeDevice"
	submitLabel={m.device_remove()}
	destructive
	onClose={() => (removing = null)}
>
	<input type="hidden" name="deviceId" value={removing?.id ?? ''} />
	<p class="text-sm">{m.device_remove_text()}</p>
</FormDialog>

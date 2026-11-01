<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	// Notifications on this device (#56): a switch that asks the browser for permission and
	// subscribes it with the push service, or unsubscribes. Where that isn't possible, it says
	// why (no support, blocked, an iPhone outside the home screen).
	import { Toggle } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { publicKey }: { publicKey: string } = $props();

	let status = $state<'loading' | 'on' | 'off' | 'blocked' | 'unsupported'>('loading');
	let busy = $state(false);
	let ios = $state(false);
	let problem = $state('');
	let tested = $state('');

	/** Sends a test and says plainly how far it got (#256) */
	async function test() {
		busy = true;
		tested = '';
		try {
			const response = await fetch('/device/push/test', { method: 'POST' });
			const { results } = (await response.json()) as { results: number[] };
			const refused = results.find((status) => status < 200 || status >= 300);
			tested =
				results.length === 0
					? m.push_test_none()
					: refused !== undefined
						? m.push_test_refused({ status: String(refused) })
						: m.push_test_sent();
		} catch {
			tested = m.push_failed();
		} finally {
			busy = false;
		}
	}

	const registration = () => navigator.serviceWorker.ready;

	onMount(async () => {
		ios = /iPhone|iPad/.test(navigator.userAgent);
		if (
			!('serviceWorker' in navigator) ||
			!('PushManager' in window) ||
			!('Notification' in window)
		) {
			status = 'unsupported';
			return;
		}
		if (Notification.permission === 'denied') {
			status = 'blocked';
			return;
		}
		const sub = await (await registration()).pushManager.getSubscription();
		status = sub ? 'on' : 'off';
		// The server may not know this browser (anymore), or know it as someone else
		if (sub) await saveOnServer(sub).catch(() => {});
	});

	const saveOnServer = (sub: PushSubscription) =>
		fetch('/device/push', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(sub.toJSON())
		});

	async function turnOn() {
		if ((await Notification.requestPermission()) !== 'granted') {
			status = 'blocked';
			return;
		}
		const sub = await (
			await registration()
		).pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: publicKey
		});
		const response = await saveOnServer(sub);
		status = response.ok ? 'on' : 'off';
		if (!response.ok) problem = m.push_failed();
	}

	async function turnOff() {
		const sub = await (await registration()).pushManager.getSubscription();
		if (sub) {
			await fetch('/device/push', {
				method: 'DELETE',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ endpoint: sub.endpoint })
			});
			await sub.unsubscribe();
		}
		status = 'off';
	}

	async function toggle() {
		if (busy) return;
		busy = true;
		problem = '';
		tested = '';
		try {
			await (status === 'on' ? turnOff() : turnOn());
		} catch {
			status = 'off';
			problem = m.push_failed();
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex flex-col gap-1.5" role="region" aria-label={m.push_title()}>
	<div class="field-well min-h-14 justify-between gap-3 px-3.5">
		<span class="flex min-w-0 items-center gap-3">
			<span class="flex-none opacity-65"><Icon name="notifications" size={20} /></span>
			<span class="font-medium">{m.push_toggle()}</span>
		</span>
		<Toggle
			checked={status === 'on'}
			disabled={busy || status === 'loading' || status === 'blocked' || status === 'unsupported'}
			onChange={toggle}
			aria-label={m.push_toggle()}
		/>
	</div>
	<p class="text-sm text-muted">
		{#if status === 'blocked'}
			{m.push_blocked()}
		{:else if status === 'unsupported'}
			{ios ? m.push_ios_hint() : m.push_unsupported()}
		{:else}
			{m.push_hint()}
		{/if}
	</p>
	{#if problem}<p class="text-sm tone-destructive" role="alert">{problem}</p>{/if}
	{#if status === 'on'}
		<button
			type="button"
			class="min-h-11 self-start text-sm font-medium text-accent dark:text-accent-night"
			disabled={busy}
			onclick={test}>{m.push_test()}</button
		>
		{#if tested}<p class="text-sm text-muted" role="status">{tested}</p>{/if}
	{/if}
</div>

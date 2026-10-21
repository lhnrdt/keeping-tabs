<script lang="ts">
	import type { SubmitFunction } from '$app/forms';
	import { enhance } from '$app/forms';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getMe, rememberGroup, setMe } from '#lib/device.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let mounted = $state(false);
	let meId = $state<string | null>(null);
	let choosing = $state(false);
	let editingGroup = $state(false);
	let renamingId = $state<string | null>(null);
	let copied = $state(false);

	const me = $derived(data.members.find((member) => member.id === meId));
	const shareUrl = $derived(
		new URL(resolve('/g/[token]', { token: data.group.shareToken }), page.url.origin).href
	);

	onMount(() => {
		// The creator arrives with ?me=<id> after creating the group
		const fromLink = page.url.searchParams.get('me');
		if (fromLink) {
			setMe(data.group.id, fromLink);
			replaceState(resolve('/g/[token]', { token: data.group.shareToken }), page.state);
		}
		meId = getMe(data.group.id);
		mounted = true;
	});

	$effect(() => {
		rememberGroup({ id: data.group.id, token: data.group.shareToken, name: data.group.name });
	});

	function pick(memberId: string) {
		setMe(data.group.id, memberId);
		meId = memberId;
		choosing = false;
	}

	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({ title: data.group.name, url: shareUrl });
			} catch {
				// Dismissed by the user
			}
			return;
		}
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	/** Default enhance behaviour, then closes the inline editor if the action succeeded. */
	const closeOnSuccess =
		(close: () => void): SubmitFunction =>
		() =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success') close();
		};

	const confirmRegenerate: SubmitFunction = ({ cancel }) => {
		if (!confirm(m.regenerate_confirm())) cancel();
	};
</script>

<svelte:head>
	<title>{data.group.name} – {m.app_name()}</title>
</svelte:head>

{#snippet actor()}
	<input type="hidden" name="actor" value={meId ?? ''} />
{/snippet}

{#snippet error(action: string, memberId?: string)}
	{#if form?.action === action && (!memberId || form.memberId === memberId)}
		<p class="text-sm text-red-700" role="alert">{errorMessage(form.error)}</p>
	{/if}
{/snippet}

<main class="mx-auto max-w-md space-y-8 p-4">
	<header class="space-y-1">
		<a class="text-sm text-blue-700 underline" href={resolve('/')}>{m.app_name()}</a>
		{#if editingGroup}
			<form
				method="POST"
				action="?/updateGroup"
				class="space-y-3"
				use:enhance={closeOnSuccess(() => (editingGroup = false))}
			>
				{@render actor()}
				<label class="block">
					<span class="text-sm font-medium">{m.field_group_name()}</span>
					<input
						class="mt-1 block w-full rounded-md"
						name="name"
						required
						maxlength={LIMITS.groupName}
						value={data.group.name}
					/>
				</label>
				<label class="block">
					<span class="text-sm font-medium">{m.field_description()}</span>
					<textarea
						class="mt-1 block w-full rounded-md"
						name="description"
						rows="2"
						maxlength={LIMITS.description}
						value={data.group.description ?? ''}></textarea>
				</label>
				{@render error('updateGroup')}
				<div class="flex gap-2">
					<button class="rounded-md bg-blue-700 px-3 py-1.5 text-white">{m.save()}</button>
					<button type="button" class="px-3 py-1.5" onclick={() => (editingGroup = false)}>
						{m.cancel()}
					</button>
				</div>
			</form>
		{:else}
			<h1 class="text-2xl font-bold">{data.group.name}</h1>
			{#if data.group.description}
				<p class="whitespace-pre-line text-gray-600">{data.group.description}</p>
			{/if}
			<p class="text-sm text-gray-500">{m.field_currency()}: {data.group.currency}</p>
			<button class="text-sm text-blue-700 underline" onclick={() => (editingGroup = true)}>
				{m.edit_group()}
			</button>
		{/if}
	</header>

	{#if mounted && (!me || choosing)}
		<section
			aria-labelledby="who"
			class="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4"
		>
			<h2 id="who" class="font-semibold">{m.who_are_you()}</h2>
			<p class="text-sm text-gray-600">{m.who_are_you_hint()}</p>
			<div class="flex flex-wrap gap-2">
				{#each data.members as member (member.id)}
					<button
						class="rounded-full border bg-white px-3 py-1"
						aria-pressed={member.id === meId}
						onclick={() => pick(member.id)}
					>
						{member.name}
					</button>
				{/each}
			</div>
		</section>
	{:else if me}
		<p class="text-sm">
			{m.you_are({ name: me.name })}
			<button class="text-blue-700 underline" onclick={() => (choosing = true)}>
				{m.switch_member()}
			</button>
		</p>
	{/if}

	<section aria-labelledby="members" class="space-y-3">
		<h2 id="members" class="text-lg font-semibold">{m.members_title()}</h2>
		<ul class="divide-y rounded-lg border">
			{#each data.members as member (member.id)}
				<li class="p-3">
					{#if renamingId === member.id}
						<form
							method="POST"
							action="?/renameMember"
							class="space-y-2"
							use:enhance={closeOnSuccess(() => (renamingId = null))}
						>
							{@render actor()}
							<input type="hidden" name="memberId" value={member.id} />
							<input
								class="block w-full rounded-md"
								name="name"
								aria-label={m.rename_member({ name: member.name })}
								required
								maxlength={LIMITS.memberName}
								value={member.name}
							/>
							{@render error('renameMember', member.id)}
							<div class="flex gap-2">
								<button class="rounded-md bg-blue-700 px-3 py-1.5 text-white">{m.save()}</button>
								<button type="button" class="px-3 py-1.5" onclick={() => (renamingId = null)}>
									{m.cancel()}
								</button>
							</div>
						</form>
					{:else}
						<div class="flex items-center justify-between gap-2">
							<span>
								{member.name}
								{#if member.id === meId}
									<span class="text-sm text-gray-500">({m.member_you()})</span>
								{/if}
							</span>
							<button
								class="text-sm text-blue-700 underline"
								aria-label={m.rename_member({ name: member.name })}
								onclick={() => (renamingId = member.id)}
							>
								{m.rename()}
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		<form method="POST" action="?/addMember" use:enhance class="space-y-2">
			{@render actor()}
			<div class="flex gap-2">
				<input
					class="block w-full rounded-md"
					name="name"
					aria-label={m.field_member_name()}
					required
					maxlength={LIMITS.memberName}
				/>
				<button class="shrink-0 rounded-md bg-blue-700 px-3 py-1.5 text-white">
					{m.add_member()}
				</button>
			</div>
			{@render error('addMember')}
		</form>
	</section>

	<section aria-labelledby="share" class="space-y-2">
		<h2 id="share" class="text-lg font-semibold">{m.share_title()}</h2>
		<p class="text-sm text-gray-600">{m.share_hint()}</p>
		<input
			class="block w-full rounded-md bg-gray-50 text-sm"
			readonly
			value={shareUrl}
			aria-label={m.share_title()}
			onfocus={(event) => event.currentTarget.select()}
		/>
		<button class="rounded-md bg-blue-700 px-3 py-1.5 text-white" onclick={share}>
			{copied ? m.share_copied() : m.share_button()}
		</button>
		<form method="POST" action="?/regenerateLink" use:enhance={confirmRegenerate} class="pt-2">
			{@render actor()}
			<button class="text-sm text-red-700 underline">{m.regenerate_link()}</button>
			<p class="text-xs text-gray-500">{m.regenerate_hint()}</p>
		</form>
	</section>
</main>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getRecentGroups, type RecentGroup } from '#lib/device.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let recent = $state<RecentGroup[]>([]);
	let extraRows = $state(0);
	const memberRows = $derived(Math.max(2, form?.values.members.length ?? 0) + extraRows);
	const currency = $derived(form?.values.currency || data.defaultCurrency);

	onMount(() => {
		recent = getRecentGroups();
	});
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<main class="mx-auto max-w-md space-y-8 p-4">
	<header>
		<h1 class="text-2xl font-bold">{m.app_name()}</h1>
		<p class="text-gray-600">{m.home_tagline()}</p>
	</header>

	{#if recent.length}
		<section aria-labelledby="your-groups">
			<h2 id="your-groups" class="mb-2 text-lg font-semibold">{m.home_your_groups()}</h2>
			<ul class="divide-y rounded-lg border">
				{#each recent as group (group.id)}
					<li>
						<a
							class="block p-3 hover:bg-gray-50"
							href={resolve('/g/[token]', { token: group.token })}
						>
							{group.name}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section aria-labelledby="create">
		<h2 id="create" class="mb-2 text-lg font-semibold">{m.create_title()}</h2>
		<form method="POST" use:enhance class="space-y-4">
			<label class="block">
				<span class="text-sm font-medium">{m.field_group_name()}</span>
				<input
					class="mt-1 block w-full rounded-md"
					name="name"
					required
					maxlength={LIMITS.groupName}
					value={form?.values.name ?? ''}
				/>
			</label>
			<label class="block">
				<span class="text-sm font-medium">{m.field_description()}</span>
				<textarea
					class="mt-1 block w-full rounded-md"
					name="description"
					rows="2"
					maxlength={LIMITS.description}
					value={form?.values.description ?? ''}></textarea>
			</label>
			<label class="block">
				<span class="text-sm font-medium">{m.field_currency()}</span>
				<select class="mt-1 block w-full rounded-md" name="currency">
					{#each data.currencies as option (option.code)}
						<option value={option.code} selected={option.code === currency}>{option.label}</option>
					{/each}
				</select>
			</label>
			<label class="block">
				<span class="text-sm font-medium">{m.field_your_name()}</span>
				<input
					class="mt-1 block w-full rounded-md"
					name="you"
					required
					maxlength={LIMITS.memberName}
					value={form?.values.you ?? ''}
				/>
			</label>
			<fieldset class="space-y-2">
				<legend class="text-sm font-medium">{m.field_other_members()}</legend>
				{#each { length: memberRows }, i (i)}
					<input
						class="block w-full rounded-md"
						name="member"
						aria-label={m.field_member_name()}
						maxlength={LIMITS.memberName}
						value={form?.values.members[i] ?? ''}
					/>
				{/each}
				<button type="button" class="text-sm text-blue-700 underline" onclick={() => extraRows++}>
					{m.add_another()}
				</button>
			</fieldset>

			{#if form?.error}
				<p class="text-red-700" role="alert">{errorMessage(form.error)}</p>
			{/if}

			<button class="w-full rounded-md bg-blue-700 px-4 py-2 font-semibold text-white">
				{m.create_submit()}
			</button>
		</form>
	</section>
</main>

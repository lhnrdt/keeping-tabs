<script lang="ts">
	// Joining a group (A-4): one tap on "Which one are you?" when someone added you, or Join
	// with your name. A name that looks like someone added ("Ben Smith" → Ben) asks first,
	// so nobody ends up in a group twice.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Block, BlockTitle, List } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ThemePattern from '#lib/components/illustrations/ThemePattern.svelte';
	import PersonPill from '#lib/components/people/PersonPill.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { kindIcons } from '#lib/group/kind-style.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { matchMember } from '#lib/group/match-member.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { groupTintClass, type Tint } from '#lib/tints.ts';
	import { LIMITS, normalizeText } from '#lib/validation.ts';

	type Props = {
		group: { name: string; shareToken: string; kind: GroupKind; tint: Tint | null };
		members: GroupMember[];
		/** Your name from other groups, to prefill */
		profileName: string | null;
		error?: ErrorCode;
	};

	let { group, members, profileName, error }: Props = $props();

	const submission = new Submission();
	const joined = $derived(members.filter((member) => member.claimed));
	const open = $derived(members.filter((member) => !member.claimed));

	let someoneElse = $state(false);
	let name = $derived(profileName ?? '');
	// "Are you Ben?" for a name that only looks like someone added; an exact name is them
	let declined = $state<string>();
	const lookalike = $derived.by(() => {
		const match = matchMember(name, open);
		const exact =
			match && match.name.toLocaleLowerCase() === normalizeText(name).toLocaleLowerCase();
		return match && !exact && declined !== match.id ? match : undefined;
	});
	const askName = $derived(open.length === 0 || someoneElse);
</script>

<AppPage title={group.name} back={{ href: resolve('/'), label: m.app_name() }}>
	{#snippet hero()}
		<header
			class="{groupTintClass(
				group.tint
			)} relative mx-4 mt-2 overflow-hidden rounded-3xl bg-(--tint-bg) px-5 pt-5 pb-6 text-(--tint-fg)"
		>
			<ThemePattern />
			<div class="relative">
				<Icon name={kindIcons[group.kind]} size={28} />
				<h1 class="font-display text-3xl leading-tight font-semibold">
					{m.join_title({ group: group.name })}
				</h1>
				{#if joined.length}
					<ul class="mt-4 flex flex-wrap gap-2" aria-label={m.join_already_here()}>
						{#each joined as member (member.id)}
							<li><PersonPill name={member.name} avatarId={member.avatarId} /></li>
						{/each}
					</ul>
				{/if}
			</div>
		</header>
	{/snippet}

	<form
		method="POST"
		action={`${resolve('/g/[token]', { token: group.shareToken })}?/join`}
		use:enhance={submission.enhance}
	>
		{#if open.length}
			<BlockTitle>{m.join_which()}</BlockTitle>
			<div class="mx-4 mt-3 mb-6 flex flex-col gap-2">
				{#each open as member (member.id)}
					<button
						type="submit"
						name="memberId"
						value={member.id}
						disabled={submission.pending}
						class="flex min-h-14 items-center gap-3 rounded-2xl bg-surface px-4 text-start text-lg font-medium shadow-[0_0_0_1px_rgb(37_40_34/0.08)] hover:bg-surface-muted focus-visible:ring-2 active:scale-[0.99] dark:bg-surface-night dark:hover:bg-surface-muted-night"
					>
						<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} />
						{m.join_i_am({ name: member.name })}
					</button>
				{/each}
				{#if !someoneElse}
					<button
						type="button"
						class="mt-1 self-start rounded-full px-2 py-2 text-sm font-medium text-accent dark:text-accent-night"
						onclick={() => (someoneElse = true)}
					>
						{m.join_someone_else()}
					</button>
				{/if}
			</div>
		{/if}

		{#if askName}
			<List strong inset>
				<Field
					label={m.join_name()}
					name="name"
					required
					maxlength={LIMITS.memberName}
					autocomplete="given-name"
					bind:value={name}
				/>
			</List>
			{#if lookalike}
				<Block class="!my-3 space-y-2" aria-live="polite">
					<p class="font-medium">{m.join_are_you({ name: lookalike.name })}</p>
					<div class="flex flex-wrap gap-2">
						<button
							type="submit"
							name="memberId"
							value={lookalike.id}
							class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white dark:bg-accent-night dark:text-canvas-night"
						>
							{m.join_yes({ name: lookalike.name })}
						</button>
						<button
							type="button"
							class="rounded-full px-4 py-2 text-sm font-medium text-accent dark:text-accent-night"
							onclick={() => (declined = lookalike?.id)}
						>
							{m.join_no()}
						</button>
					</div>
				</Block>
			{:else}
				<Block>
					<SubmitButton pending={submission.pending}>{m.join_submit()}</SubmitButton>
				</Block>
			{/if}
		{/if}
		<FormError {error} />
	</form>
</AppPage>

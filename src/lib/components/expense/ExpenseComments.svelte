<script lang="ts">
	// A short conversation under an expense (#49): "Was the tip included?". Oldest first, each
	// with who wrote it and when; your own have a red Remove. Only members can write. Written
	// without a connection, it waits on the device below the others and goes out once online (#347).
	import { enhance } from '$app/forms';
	import { entryOf, longPress } from '#lib/actions/long-press.ts';
	import EntryMenu, { type MenuItem } from '#lib/components/EntryMenu.svelte';
	import { copyText } from '#lib/clipboard.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { calmMove, calmSlide } from '#lib/motion/calm.ts';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { LIMITS } from '#lib/validation.ts';
	import { errorMessage } from '#lib/errors.ts';
	import { drop, keep, unreachable } from '#lib/offline/outbox.ts';
	import { watchPending } from '#lib/offline/pending.svelte.ts';

	type Comment = { id: string; memberId: string; body: string; createdAt: Date };
	type Author = { id: string; name: string; avatarId?: string; avatar?: string | null };

	type Props = {
		comments: Comment[];
		/** Current and former members, for the names */
		authors: Author[];
		/** The viewer's member id; null before they have joined */
		me: string | null;
		error?: ErrorCode;
		/** What they wrote, kept when it couldn't be sent */
		draft?: string;
		/** The group's link token and the expense, so a comment can wait for the connection */
		token: string;
		expenseId: string;
	};

	let { comments, authors, me, error, draft = '', token, expenseId }: Props = $props();

	const waiting = watchPending((items) =>
		items.filter((item) => item.kind === 'comment' && item.target === expenseId)
	);
	const fieldsOf = (form: FormData) =>
		[...form].map(([key, value]) => [key, String(value)]) as [string, string][];

	const byId = $derived(new Map(authors.map((author) => [author.id, author])));
	const when = (date: Date) =>
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
	let sending = $state(false);

	// Press and hold a comment: copy it, or take back your own
	let held = $state<(typeof comments)[number] | null>(null);
	const hold = (target: Element) => {
		const id = entryOf(target);
		held = comments.find((comment) => comment.id === id) ?? null;
	};
	const menuItems = (comment: (typeof comments)[number]): MenuItem[] => [
		{ label: m.copy(), onclick: () => void copyText(comment.body) },
		...(comment.memberId === me
			? [
					{
						label: m.comment_remove(),
						action: '?/uncomment',
						fields: { commentId: comment.id },
						destructive: true
					}
				]
			: [])
	];
</script>

<EntryMenu
	title={held ? (byId.get(held.memberId)?.name ?? '?') : null}
	items={held ? menuItems(held) : []}
	onClose={() => (held = null)}
/>

<section class="flex flex-col gap-3 px-4 pt-4" aria-label={m.comments_title()}>
	<h2 class="field-label">{m.comments_title()}</h2>
	{#if comments.length}
		<ul class="flex flex-col gap-3" use:longPress={hold}>
			{#each comments as comment (comment.id)}
				{@const author = byId.get(comment.memberId)}
				<li class="flex gap-3" data-entry={comment.id} transition:calmSlide animate:calmMove>
					<Avatar
						id={author?.avatarId ?? comment.memberId}
						name={author?.name ?? '?'}
						avatar={author?.avatar}
						size="sm"
					/>
					<div class="min-w-0 flex-1">
						<p class="flex flex-wrap items-baseline gap-x-2 text-sm">
							<span class="font-medium">{author?.name ?? '?'}</span>
							<span class="text-xs text-muted">{when(comment.createdAt)}</span>
						</p>
						<p class="selectable text-sm break-words whitespace-pre-line">{comment.body}</p>
					</div>
					{#if comment.memberId === me}
						<form method="POST" action="?/uncomment" use:enhance>
							<input type="hidden" name="commentId" value={comment.id} />
							<button type="submit" class="min-h-8 text-sm font-medium tone-destructive"
								>{m.comment_remove()}</button
							>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
	{:else if waiting.items.length === 0}
		<p class="text-sm text-muted">{m.comments_empty()}</p>
	{/if}
	{#if waiting.items.length && me}
		{@const author = byId.get(me)}
		<ul class="flex flex-col gap-3" aria-label={m.pending_title()}>
			{#each waiting.items as item (item.id)}
				<li class="flex gap-3" data-entry={item.id} transition:calmSlide>
					<Avatar
						id={author?.avatarId ?? me}
						name={author?.name ?? '?'}
						avatar={author?.avatar}
						size="sm"
					/>
					<div class="min-w-0 flex-1">
						<p class="flex flex-wrap items-baseline gap-x-2 text-sm">
							<span class="font-medium">{author?.name ?? '?'}</span>
							{#if item.failed}
								<span class="text-xs tone-destructive"
									>{m.pending_failed({ reason: errorMessage(item.failed) ?? '' })}</span
								>
							{:else}
								<span class="flex items-center gap-1 text-xs text-muted" aria-live="polite"
									><Icon name="offline" size={14} />{waiting.online
										? m.pending_syncing()
										: m.pending_waiting()}</span
								>
							{/if}
						</p>
						<p class="selectable text-sm break-words whitespace-pre-line text-muted">
							{item.title}
						</p>
					</div>
					<button
						type="button"
						class="min-h-8 text-sm font-medium tone-destructive"
						onclick={() => drop(item.id)}>{m.comment_remove()}</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	{#if me}
		<form
			method="POST"
			action="?/comment"
			data-announce="comment"
			class="flex flex-col gap-2"
			use:enhance={(input) => {
				// Its id, made here: its sealed text says it belongs to this comment
				const clientId = crypto.randomUUID();
				input.formData.set('clientId', clientId);
				const written = String(input.formData.get('comment') ?? '').trim();
				return sealing(
					['comment'],
					(sealed) => {
						sending = true;
						return async ({ result, update, formElement }) => {
							// No connection: it waits on this device, shown below the others
							if (result.type === 'error' && unreachable(result.error) && written) {
								const kept = keep({
									id: clientId,
									kind: 'comment',
									target: expenseId,
									token,
									action: sealed.action.href,
									fields: fieldsOf(sealed.formData),
									title: written,
									amount: '',
									date: '',
									addedAt: Date.now()
								});
								if (kept) {
									formElement.reset();
									sending = false;
									return;
								}
							}
							await update();
							sending = false;
						};
					},
					() => clientId
				)(input);
			}}
		>
			<PlainField label={m.comment_field()}>
				{#snippet children(id)}
					<textarea
						{id}
						name="comment"
						rows="2"
						maxlength={LIMITS.comment}
						placeholder={m.comment_placeholder()}
						value={draft}></textarea>
				{/snippet}
			</PlainField>
			<FormError {error} />
			<SubmitButton tonal pending={sending}>{m.comment_send()}</SubmitButton>
		</form>
	{/if}
</section>

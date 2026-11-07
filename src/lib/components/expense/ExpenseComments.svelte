<script lang="ts">
	// A short conversation under an expense (#49): "Was the tip included?". Oldest first, each
	// with who wrote it and when; your own have a red Remove. Only members can write.
	import { enhance } from '$app/forms';
	import Avatar from '#lib/components/Avatar.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { calmMove, calmSlide } from '#lib/motion/calm.ts';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { LIMITS } from '#lib/validation.ts';

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
	};

	let { comments, authors, me, error, draft = '' }: Props = $props();

	const byId = $derived(new Map(authors.map((author) => [author.id, author])));
	const when = (date: Date) =>
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
	let sending = $state(false);
</script>

<section class="flex flex-col gap-3 px-4 pt-4" aria-label={m.comments_title()}>
	<h2 class="field-label">{m.comments_title()}</h2>
	{#if comments.length}
		<ul class="flex flex-col gap-3">
			{#each comments as comment (comment.id)}
				{@const author = byId.get(comment.memberId)}
				<li class="flex gap-3" transition:calmSlide animate:calmMove>
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
						<p class="text-sm break-words whitespace-pre-line">{comment.body}</p>
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
	{:else}
		<p class="text-sm text-muted">{m.comments_empty()}</p>
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
				return sealing(
					['comment'],
					() => {
						sending = true;
						return async ({ update }) => {
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

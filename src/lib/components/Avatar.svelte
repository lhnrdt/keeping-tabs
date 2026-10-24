<script lang="ts">
	// A person's avatar (#61): the nature icon they chose, or their initials, on their tint
	// (chosen, else derived from them). Decorative: the name is always shown next to it, so
	// the initials are drawn with CSS and stay out of the text content.
	import { avatarIcons } from '#lib/avatar-icons.ts';
	import { parseAvatar } from '#lib/avatars.ts';
	import { initials } from '#lib/group/members.ts';
	import { tintClass } from '#lib/tints.ts';

	type Props = {
		id: string;
		name: string;
		/** The person's choice, e.g. "deer:moss" */
		avatar?: string | null;
		size?: 'sm' | 'md' | 'lg';
	};

	let { id, name, avatar, size = 'md' }: Props = $props();

	const choice = $derived(parseAvatar(avatar));
	const Glyph = $derived(choice?.icon ? avatarIcons[choice.icon] : null);
	const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };
	const iconSizes = { sm: 16, md: 20, lg: 26 };
</script>

<span
	class="{tintClass(
		id,
		choice?.tint
	)} grid shrink-0 place-items-center rounded-full bg-(--tint-bg) font-semibold text-(--tint-fg) {Glyph
		? ''
		: 'before:content-[attr(data-initials)]'} {sizes[size]}"
	data-initials={Glyph ? undefined : initials(name)}
	aria-hidden="true"
>
	{#if Glyph}<Glyph size={iconSizes[size]} stroke={1.75} />{/if}
</span>

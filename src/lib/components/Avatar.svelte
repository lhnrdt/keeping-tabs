<script lang="ts">
	// A member's initials on their tint. Decorative: the name is always shown next to it, so
	// the initials are drawn with CSS and stay out of the text content.
	import { initials } from '#lib/group/members.ts';
	import { tintClass } from '#lib/tints.ts';

	type Props = { id: string; name: string; size?: 'sm' | 'md' };

	let { id, name, size = 'md' }: Props = $props();
</script>

<span
	class="{tintClass(
		id
	)} grid shrink-0 place-items-center rounded-full bg-(--tint-bg) font-semibold text-(--tint-fg) before:content-[attr(data-initials)] {size ===
	'sm'
		? 'h-7 w-7 text-xs'
		: 'h-9 w-9 text-sm'}"
	data-initials={initials(name)}
	aria-hidden="true"
></span>

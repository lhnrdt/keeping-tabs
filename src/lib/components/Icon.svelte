<script lang="ts">
	// Every icon in the app: same family, stroke and default size (style guide).
	import { icons, type IconName } from '#lib/icons.ts';

	type Props = { name: IconName; size?: number; class?: string };

	let { name, size = 22, class: className = '' }: Props = $props();

	const Glyph = $derived(icons[name]);
</script>

<Glyph {size} stroke={1.75} class={className} aria-hidden="true" />

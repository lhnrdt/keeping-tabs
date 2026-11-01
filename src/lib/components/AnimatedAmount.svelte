<script lang="ts">
	// A money amount that counts to its new value when it changes (N-12).
	import { prefersReducedMotion, Tween } from 'svelte/motion';
	// Same curve as --ease-calm in theme.css
	import { quintOut } from 'svelte/easing';
	import { shownAmount } from '#lib/shown-money.ts';

	type Props = {
		amount: number;
		currency: string;
		/** Wraps the formatted amount, e.g. a translated "owes {amount}" */
		label?: (amount: string) => string;
	};

	let { amount, currency, label = (text) => text }: Props = $props();

	const tween = Tween.of(() => amount, {
		duration: () => (prefersReducedMotion.current ? 0 : 320),
		easing: quintOut
	});
</script>

{label(shownAmount(Math.round(tween.current), currency))}

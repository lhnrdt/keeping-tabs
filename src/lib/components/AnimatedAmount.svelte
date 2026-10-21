<script lang="ts">
	// A money amount that counts to its new value when it changes (N-12).
	import { prefersReducedMotion, Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { formatAmount } from '#lib/money.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Props = {
		amount: number;
		currency: string;
		/** Wraps the formatted amount, e.g. a translated "owes {amount}" */
		label?: (amount: string) => string;
	};

	let { amount, currency, label = (text) => text }: Props = $props();

	const tween = Tween.of(() => amount, {
		duration: () => (prefersReducedMotion.current ? 0 : 400),
		easing: cubicOut
	});
</script>

{label(formatAmount(Math.round(tween.current), currency, getLocale()))}

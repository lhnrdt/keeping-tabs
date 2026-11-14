<script lang="ts">
	// Draw your own avatar (#158): with a finger or mouse on the avatar's tint, in one of a few line
	// widths, with undo and clear. Each finished line goes into the form's hidden fields and sends a
	// change, so it's saved like any other choice.
	import { fits, pathOf, type Point } from '#lib/avatar-drawing.ts';
	import { DRAWING_SIZE, STROKE_WIDTHS, type Drawing } from '#lib/avatars.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { tick } from 'svelte';

	type Props = {
		/** The avatar's tint class, as the background */
		tint: string;
		/** What was saved, to go on from */
		initial?: Drawing;
		/** The drawing so far, for the preview */
		onDraw: (drawing: Drawing) => void;
	};

	let { tint, initial, onDraw }: Props = $props();

	/** Saved paths come back as one stroke per "M" */
	const strokesOf = (d: string): Point[][] =>
		d
			.split('M')
			.filter(Boolean)
			.map((stroke) => stroke.split('L').map((point) => point.split(' ').map(Number) as Point));

	const start = () => ({ strokes: strokesOf(initial?.d ?? ''), width: initial?.width ?? 1 });
	let strokes = $state(start().strokes);
	let width = $state(start().width);
	let current: Point[] | null = $state(null);
	let full = $state(false);
	let fields: HTMLInputElement;
	let pad: SVGSVGElement;

	const d = $derived(pathOf(current ? [...strokes, current] : strokes));

	/** Into the form, which saves it */
	function commit() {
		onDraw({ width, d: pathOf(strokes) });
		// Once the hidden fields hold it
		void tick().then(() => fields.dispatchEvent(new Event('change', { bubbles: true })));
	}

	function pointAt(event: PointerEvent): Point {
		const box = pad.getBoundingClientRect();
		return [
			((event.clientX - box.left) / box.width) * DRAWING_SIZE,
			((event.clientY - box.top) / box.height) * DRAWING_SIZE
		];
	}

	function down(event: PointerEvent) {
		pad.setPointerCapture(event.pointerId);
		current = [pointAt(event)];
	}
	function move(event: PointerEvent) {
		if (current) current = [...current, pointAt(event)];
	}
	function up() {
		if (!current) return;
		const next = [...strokes, current];
		current = null;
		full = !fits(next);
		if (full) return;
		strokes = next;
		commit();
	}

	function undo() {
		strokes = strokes.slice(0, -1);
		full = false;
		commit();
	}
	function clear() {
		strokes = [];
		full = false;
		commit();
	}
	function thickness(index: number) {
		width = index;
		commit();
	}
</script>

<div class="flex flex-col gap-3 px-4 pb-3">
	<input bind:this={fields} type="hidden" name="width" value={width} />
	<input type="hidden" name="drawing" value={pathOf(strokes)} />
	<svg
		bind:this={pad}
		viewBox="0 0 {DRAWING_SIZE} {DRAWING_SIZE}"
		class="{tint} aspect-square w-full touch-none rounded-full bg-(--tint-bg) text-(--tint-fg)"
		role="img"
		aria-label={m.avatar_draw_pad()}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
	>
		<path
			{d}
			fill="none"
			stroke="currentColor"
			stroke-width={STROKE_WIDTHS[width]}
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
	{#if full}<p class="text-center text-sm text-muted" role="status">{m.avatar_draw_full()}</p>{/if}
	<div class="flex flex-wrap items-center justify-center gap-2">
		{#each STROKE_WIDTHS as stroke, index (stroke)}
			<button
				type="button"
				class="grid size-11 place-items-center rounded-full {width === index
					? 'bg-current/15'
					: ''}"
				aria-pressed={width === index}
				aria-label={m.avatar_draw_width({ size: index + 1 })}
				onclick={() => thickness(index)}
			>
				<span
					class="rounded-full bg-current"
					style="width: {stroke * 2.4}px; height: {stroke * 2.4}px"
				></span>
			</button>
		{/each}
		<button
			type="button"
			class="min-h-11 px-3 text-sm font-medium"
			disabled={strokes.length === 0}
			onclick={undo}>{m.avatar_draw_undo()}</button
		>
		<button
			type="button"
			class="min-h-11 px-3 text-sm font-medium tone-destructive"
			disabled={strokes.length === 0}
			onclick={clear}
		>
			<Icon name="delete" size={16} />
			<span class="sr-only">{m.avatar_draw_clear()}</span>
		</button>
	</div>
</div>

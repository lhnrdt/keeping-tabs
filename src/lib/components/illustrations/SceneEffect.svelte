<!-- What a tapped scene's action leaves in the air (#327): swoosh lines and particles round the shapes that move, drawn once, in the header's ink -->
<script lang="ts">
	type Props = { move: string; x: number; y: number; w: number; h: number };
	let { move, x, y, w, h }: Props = $props();

	const cx = $derived(x + w / 2);
	const cy = $derived(y + h / 2);
	const bottom = $derived(y + h);
	/** Which way it's going: speed lines and dust go behind it */
	const dir = $derived(move === 'drive-left' ? -1 : 1);
	const rear = $derived(dir > 0 ? x : x + w);
	const reach = $derived(Math.max(w, h) / 2 + 6);
	/** Evenly round a circle */
	const around = (n: number, r: number, turn = 0) =>
		Array.from({ length: n }, (_, i) => {
			const a = ((i + turn) / n) * Math.PI * 2;
			return { dx: Math.cos(a) * r, dy: Math.sin(a) * r };
		});
</script>

<g class="scene-fx" stroke="var(--tint-fg)" fill="var(--tint-fg)" stroke-linecap="round">
	{#if move === 'drive' || move === 'drive-left'}
		<!-- It moves, so what trails it moves with it -->
		<g class="tap-{move}">
			{#each [0.3, 0.55, 0.8] as at, i (at)}
				<line
					class="fx-speed"
					style="animation-delay: {i * 60}ms"
					x1={rear - dir * 4}
					y1={y + h * at}
					x2={rear - dir * (22 + i * 8)}
					y2={y + h * at}
					stroke-width="1.6"
					stroke-opacity="0.45"
				/>
			{/each}
			{#each [0, 1, 2, 3] as i (i)}
				<circle
					class="fx-dust"
					style="--dx: {-dir * (10 + i * 7)}px; --dy: {-4 - i * 3}px; animation-delay: {i * 70}ms"
					cx={rear}
					cy={bottom - 2}
					r={2 + (i % 2)}
					fill-opacity="0.35"
					stroke="none"
				/>
			{/each}
		</g>
	{:else if move === 'hop'}
		{#each [-1, 1] as side (side)}
			<circle
				class="fx-landing"
				style="--dx: {side * 12}px; --dy: -3px"
				{cx}
				cy={bottom}
				r="2.2"
				fill-opacity="0.4"
				stroke="none"
			/>
			<line
				class="fx-lift"
				x1={cx + side * (w / 2 + 4)}
				y1={bottom - 2}
				x2={cx + side * (w / 2 + 4)}
				y2={bottom - 12}
				stroke-width="1.4"
				stroke-opacity="0.4"
			/>
		{/each}
	{:else if move === 'spin'}
		<g class="fx-spin-arcs" style="transform-origin: {cx}px {cy}px">
			{#each [0, 180] as turn (turn)}
				<path
					d="M{cx + reach} {cy}A{reach} {reach} 0 0 1 {cx} {cy + reach}"
					transform="rotate({turn} {cx} {cy})"
					fill="none"
					stroke-width="2"
					stroke-opacity="0.4"
				/>
			{/each}
		</g>
	{:else if move === 'swing' || move === 'wave'}
		<!-- A swoosh on one side only -->
		<path
			class="fx-swoosh"
			d="M{x + w + 3} {y + h * 0.15}q8 {h * 0.3} 0 {h * 0.6}"
			fill="none"
			stroke-width="1.6"
			stroke-opacity="0.45"
		/>
		<path
			class="fx-swoosh"
			style="animation-delay: 120ms"
			d="M{x + w + 9} {y + h * 0.25}q6 {h * 0.22} 0 {h * 0.44}"
			fill="none"
			stroke-width="1.2"
			stroke-opacity="0.3"
		/>
	{:else if move === 'burst' || move === 'flash' || move === 'glint'}
		{#each around(move === 'burst' ? 10 : 8, reach) as p, i (i)}
			{#if move === 'burst'}
				<circle
					class="fx-spark"
					style="--dx: {p.dx}px; --dy: {p.dy}px; animation-delay: {(i % 3) * 40}ms"
					{cx}
					{cy}
					r={1.4 + (i % 3) * 0.5}
					fill-opacity="0.55"
					stroke="none"
				/>
			{:else}
				<line
					class="fx-ray"
					x1={cx + p.dx * 0.7}
					y1={cy + p.dy * 0.7}
					x2={cx + p.dx * 1.1}
					y2={cy + p.dy * 1.1}
					stroke-width="1.4"
					stroke-opacity="0.5"
				/>
			{/if}
		{/each}
		{#if move === 'burst'}
			<circle
				class="fx-ring"
				style="transform-origin: {cx}px {cy}px"
				{cx}
				{cy}
				r={reach * 0.7}
				fill="none"
				stroke-width="1.4"
				stroke-opacity="0.4"
			/>
		{/if}
	{:else if move === 'float'}
		{#each [-0.4, 0.1, 0.5] as at, i (at)}
			<path
				class="fx-rise"
				style="--dy: {-14 - i * 6}px; animation-delay: {i * 160}ms"
				d="M{cx + w * at} {cy - 4}q0 4 4 4q-4 0-4 4q0-4-4-4q4 0 4-4Z"
				fill-opacity="0.5"
				stroke="none"
			/>
		{/each}
	{:else if move === 'sail'}
		{#each [0, 1] as i (i)}
			<path
				class="fx-wake"
				style="animation-delay: {i * 200}ms"
				d="M{x - 4 - i * 6} {bottom - 2 + i * 4}q-10 -4 -22 0"
				fill="none"
				stroke-width="1.4"
				stroke-opacity="0.45"
			/>
		{/each}
		{#each [0, 1, 2] as i (i)}
			<circle
				class="fx-dust"
				style="--dx: {-8 - i * 6}px; --dy: {-6 - i * 3}px; animation-delay: {i * 90}ms"
				cx={x}
				cy={bottom - 2}
				r="1.6"
				fill-opacity="0.4"
				stroke="none"
			/>
		{/each}
	{:else if move === 'gust'}
		<!-- The wind blowing through -->
		{#each [0.15, 0.4, 0.65] as at, i (at)}
			<path
				class="fx-wind"
				style="animation-delay: {i * 120}ms"
				d="M{x + w * 0.6} {y + h * at}q-14 -4 -28 0t-28 0"
				fill="none"
				stroke-width="1.4"
				stroke-opacity="0.4"
			/>
		{/each}
	{:else if move === 'puff'}
		{#each [-1, 0, 1, 2] as i (i)}
			<circle
				class="fx-rise"
				style="--dx: {i * 5}px; --dy: {-16 - Math.abs(i) * 4}px; animation-delay: {(i + 1) * 120}ms"
				{cx}
				cy={y + 4}
				r={2.5 + (i % 2)}
				fill-opacity="0.3"
				stroke="none"
			/>
		{/each}
	{/if}
</g>

<script lang="ts">
	// A QR code to scan with another phone. Always dark on white, in any theme: scanners need it.
	import { qrPath } from '#lib/qr.ts';

	let { text, label }: { text: string; label: string } = $props();

	const code = $derived(qrPath(text));
</script>

<svg
	viewBox={`0 0 ${code.size} ${code.size}`}
	class="mx-auto block aspect-square w-full max-w-56 rounded-xl"
	role="img"
	aria-label={label}
	shape-rendering="crispEdges"
>
	<rect width={code.size} height={code.size} fill="#fff" />
	<path d={code.path} fill="#000" />
</svg>

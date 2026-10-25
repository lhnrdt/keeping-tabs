// Press and hold (#165): runs after the pointer stays down for a while without moving away;
// a tap, a scroll or lifting early does nothing.

const HOLD_MS = 700;
const SLOP_PX = 10;

export function longPress(node: HTMLElement, onPress: () => void) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let start = { x: 0, y: 0 };
	const cancel = () => clearTimeout(timer);
	const down = (event: PointerEvent) => {
		start = { x: event.clientX, y: event.clientY };
		cancel();
		timer = setTimeout(onPress, HOLD_MS);
	};
	const move = (event: PointerEvent) => {
		if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > SLOP_PX) cancel();
	};
	// No context menu or text selection getting in the way of the hold
	const menu = (event: Event) => event.preventDefault();
	node.addEventListener('pointerdown', down);
	node.addEventListener('pointermove', move);
	node.addEventListener('contextmenu', menu);
	for (const type of ['pointerup', 'pointerleave', 'pointercancel'] as const) {
		node.addEventListener(type, cancel);
	}
	return {
		destroy() {
			cancel();
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('contextmenu', menu);
			for (const type of ['pointerup', 'pointerleave', 'pointercancel'] as const) {
				node.removeEventListener(type, cancel);
			}
		}
	};
}

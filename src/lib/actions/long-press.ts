// Press and hold (#165): runs after the pointer stays down for a while without moving away;
// a tap, a scroll or lifting early does nothing. The click that follows a hold is swallowed, so
// holding a link opens its menu without also following it. With a mouse, a right click (or the
// keyboard's menu key) does the same as holding.

const HOLD_MS = 500;
const SLOP_PX = 10;
/** A short buzz, where the device does that, to say the hold was felt */
const BUZZ_MS = 10;

/**
 * `onPress` gets what was pressed, so one list can tell its rows apart; `entryOf` finds the row's
 * `data-entry`, e.g. for a whole list's rows from the list itself
 */
export function longPress(node: HTMLElement, onPress: (target: Element) => void) {
	let target: Element = node;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let start = { x: 0, y: 0 };
	let held = false;
	/** How the last press came: a touch's own long press also sends a context menu */
	let pointer = '';
	const cancel = () => clearTimeout(timer);
	const down = (event: PointerEvent) => {
		start = { x: event.clientX, y: event.clientY };
		target = event.target as Element;
		pointer = event.pointerType;
		held = false;
		cancel();
		timer = setTimeout(() => {
			held = true;
			stopClicks();
			navigator.vibrate?.(BUZZ_MS);
			onPress(target);
		}, HOLD_MS);
	};
	// Lifting after a hold clicks whatever's there by then, like the menu's backdrop: not that
	const click = (event: Event) => {
		if (!held) return;
		held = false;
		event.preventDefault();
		event.stopPropagation();
	};
	const stopClicks = () => window.addEventListener('click', click, { capture: true, once: true });
	const move = (event: PointerEvent) => {
		if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > SLOP_PX) cancel();
	};
	// Not the browser's menu: ours, right away for a mouse or the menu key; touch waits for the hold
	const menu = (event: Event) => {
		event.preventDefault();
		if (pointer === 'touch' || pointer === 'pen') return;
		cancel();
		onPress(event.target as Element);
	};
	// On the way down, as what's inside (e.g. a list row's ripple) may keep it from coming back up
	node.addEventListener('pointerdown', down, true);
	node.addEventListener('pointermove', move, true);
	node.addEventListener('contextmenu', menu);
	for (const type of ['pointerup', 'pointercancel'] as const) {
		node.addEventListener(type, cancel, true);
	}
	node.addEventListener('pointerleave', cancel);
	return {
		destroy() {
			cancel();
			node.removeEventListener('pointerdown', down, true);
			node.removeEventListener('pointermove', move, true);
			node.removeEventListener('contextmenu', menu);
			window.removeEventListener('click', click, true);
			for (const type of ['pointerup', 'pointercancel'] as const) {
				node.removeEventListener(type, cancel, true);
			}
			node.removeEventListener('pointerleave', cancel);
		}
	};
}

/** The `data-entry` of the row that was pressed, if it was one */
export const entryOf = (target: Element) =>
	target.closest('[data-entry]')?.getAttribute('data-entry') ?? null;

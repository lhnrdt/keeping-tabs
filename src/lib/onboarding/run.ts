// Runs the onboarding (#331) with driver.js: a tour once per device, opening with the welcome if
// it's the first, and a tip here and there once the tours are done. Loaded only when needed.
import { m } from '#lib/paraglide/messages.js';
import { page } from '$app/state';
import { adopt, declineAll, hasSeen, markSeen, mayShow } from './seen';

/** What the person's other devices have seen, as loaded with this page (#331) */
const known = () => adopt((page.data as { onboarding?: string[] }).onboarding ?? []);
import { TOURS, welcome, type TourName } from './tours';

const WELCOME = 'welcome';
/** Long enough for a tab to open what the next step points at */
const WAIT_MS = 5000;

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let running = false;

/** The tour of a screen, the first time it's seen here; whether it started */
export async function startTour(name: TourName): Promise<boolean> {
	known();
	if (running || hasSeen(name) || !mayShow()) return false;
	running = true;
	const [{ driver }] = await Promise.all([
		import('driver.js'),
		import('driver.js/dist/driver.css')
	]);
	const greet = !hasSeen(WELCOME);
	const tour = driver({
		steps: [...(greet ? [welcome(() => (declineAll(), tour.destroy()))] : []), ...TOURS[name]()],
		popoverClass: 'kt-tour',
		showProgress: true,
		progressText: m.onboarding_progress({ current: '{{current}}', total: '{{total}}' }),
		nextBtnText: m.onboarding_next(),
		prevBtnText: m.onboarding_back(),
		doneBtnText: m.onboarding_done(),
		closeBtnLabel: m.onboarding_close(),
		animate: !calm(),
		smoothScroll: !calm(),
		stagePadding: 6,
		stageRadius: 16,
		overlayOpacity: 0.45,
		waitForElement: WAIT_MS,
		skipMissingElement: true,
		onHighlighted: () => {
			if (greet) markSeen(WELCOME);
		},
		onDestroyed: () => {
			markSeen(name);
			running = false;
		}
	});
	tour.drive();
	return true;
}

/** A tip on something, once, when no tour is on */
export async function showTip(name: string, element: Element, text: string) {
	const tip = `tip-${name}`;
	known();
	if (running || hasSeen(tip) || !mayShow()) return;
	const [{ hints }] = await Promise.all([
		import('driver.js/hints'),
		import('driver.js/dist/hints.css')
	]);
	const shown = hints({
		popoverClass: 'kt-tour',
		buttonText: m.tip_got_it(),
		beacon: { animate: !calm() },
		onDismiss: () => markSeen(tip),
		onButtonClick: () => {
			markSeen(tip);
			shown.hide();
		},
		hints: [{ id: tip, element, popover: { title: m.tip_title(), description: text } }]
	});
	shown.show();
}

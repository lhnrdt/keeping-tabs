// Installing the app (#352): where the browser offers it (Chrome, Edge, Samsung Internet), our own
// button opens its install dialog; on an iPhone or iPad, where no browser offers it, the way there
// is shown (Share, then Add to Home Screen). Nothing once it's installed.
type InstallPrompt = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
	interface Window {
		/** Kept by app.html, which hears it before the app is there */
		installPrompt?: InstallPrompt | null;
	}
}

const DISMISSED = 'kt-install-dismissed';

class Install {
	/** The browser offers installing it */
	canPrompt = $state(false);
	/** Opened as the installed app */
	installed = $state(false);
	/** An iPhone or iPad: the way there is shown instead */
	apple = $state(false);
	/** "Not now" on the start screen's card */
	dismissed = $state(false);

	/** Whether anything can be offered here */
	get available() {
		return !this.installed && (this.canPrompt || this.apple);
	}

	start() {
		this.installed =
			matchMedia('(display-mode: standalone)').matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		this.apple =
			/iPhone|iPad|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		this.canPrompt = Boolean(window.installPrompt);
		try {
			this.dismissed = localStorage.getItem(DISMISSED) !== null;
		} catch {
			// Shown again then
		}
		const offered = () => (this.canPrompt = Boolean(window.installPrompt));
		const done = () => {
			this.installed = true;
			this.canPrompt = false;
		};
		window.addEventListener('kt-installable', offered);
		window.addEventListener('appinstalled', done);
		return () => {
			window.removeEventListener('kt-installable', offered);
			window.removeEventListener('appinstalled', done);
		};
	}

	/** The browser's own install dialog */
	async prompt() {
		const offer = window.installPrompt;
		if (!offer) return;
		await offer.prompt();
		const { outcome } = await offer.userChoice;
		window.installPrompt = null;
		this.canPrompt = false;
		if (outcome === 'accepted') this.installed = true;
	}

	dismiss() {
		this.dismissed = true;
		try {
			localStorage.setItem(DISMISSED, '1');
		} catch {
			// Only for this visit then
		}
	}
}

export const install = new Install();

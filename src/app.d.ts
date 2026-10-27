// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Accent, Theme } from '#lib/settings.ts';
import type { Db } from '#lib/server/db/index.ts';

declare global {
	interface Window {
		/** Switches the theme without reloading (defined by the page script in app.html) */
		applyTheme?: (theme: Theme) => void;
		/** Switches the color theme without reloading (app.html) */
		applyAccent?: (accent: Accent) => void;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			db: Db;
			/** This browser's secret identity key (A-12) */
			deviceKey: string;
		}
		// interface PageData {}
		// interface PageState {}
		/** Cloudflare's, e.g. waitUntil for work after the answer (#56) */
		interface Platform {
			ctx: ExecutionContext;
		}
	}
}

export {};

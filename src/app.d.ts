// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Theme } from '#lib/settings.ts';
import type { Look } from '#lib/themes/look.ts';
import type { ThemeId } from '#lib/themes/palettes.ts';
import type { Db } from '#lib/server/db/index.ts';

declare global {
	interface Window {
		/** Switches the theme without reloading (defined by the page script in app.html) */
		applyTheme?: (theme: Theme) => void;
		/** Switches the colours without reloading (app.html) */
		applyAccent?: (accent: ThemeId) => void;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			db: Db;
			/** This browser's secret identity key (A-12) */
			deviceKey: string;
			/** An encrypted group's history: who this request's changes were by, sealed (#110) */
			sealActivity?: { groupId: string; memberId: string; sealed: string };
			/** The scenery and colours this browser shows today (#332) */
			look: Look;
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

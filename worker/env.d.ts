// Set with `wrangler secret put STAGING_PASSWORD --env staging`
interface Env {
	STAGING_PASSWORD?: string;
}

// Built by `vite build` (adapter-cloudflare)
declare module '*/.svelte-kit/cloudflare/_worker.js' {
	const worker: ExportedHandler<Env>;
	export default worker;
}

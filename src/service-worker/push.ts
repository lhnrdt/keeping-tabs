// Notifications (#56): shows what the server sent (src/lib/server/push.ts) and opens the
// group when one is tapped, in an open window of the app if there is one.
import { self } from '$app/service-worker';

type Payload = { title?: string; body?: string; url?: string; tag?: string };

self.addEventListener('push', (event) => {
	const payload: Payload = event.data?.json() ?? {};
	event.waitUntil(
		self.registration.showNotification(payload.title ?? 'Keeping Tabs', {
			body: payload.body,
			tag: payload.tag,
			icon: '/icons/icon-192.png',
			badge: '/icons/icon-192.png',
			data: { url: payload.url ?? '/' }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = new URL((event.notification.data as { url: string }).url, self.location.origin).href;
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
			const open = windows.find((window) => window.url.startsWith(self.location.origin));
			return open
				? open.navigate(url).then((window) => window?.focus())
				: self.clients.openWindow(url);
		})
	);
});

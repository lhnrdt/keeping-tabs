<script lang="ts">
	import { CONTROLLER } from '#lib/legal/controller.ts';
</script>

<p>
	Keeping Tabs is built to know as little about you as possible: no account, no tracking, no ads, no
	analytics. This notice explains what is stored, why, and how to get it deleted.
</p>

<h2>Who is responsible</h2>
<p>{CONTROLLER.name}, {CONTROLLER.contact}</p>

<h2>What is stored</h2>
<ul>
	<li>
		<strong>Groups</strong> you create or join: their name, description, type and color, the names of
		the people in them, and their expenses and payments (title, amount, date, category, who paid and how
		it's split). A log of who added, changed or deleted what is kept with each group, so everyone can
		see it.
	</li>
	<li>
		<strong>You</strong>: a random identity for your device, the name you use, and, if you set them
		up, your passkeys (their public part) and a recovery key. Device keys, recovery keys and
		one-time device links are stored only as hashes, never in readable form.
	</li>
	<li>
		<strong>Imports</strong>: when you import a Splitwise export, its expenses and payments become
		part of the group. The file itself isn't kept.
	</li>
</ul>
<p>
	Everyone with a group's link can see that group. Names are all the personal data you enter; there
	are no email addresses or phone numbers.
</p>

<h2>Cookies and storage in your browser</h2>
<ul>
	<li>
		<strong>Device identity</strong> (<code>kt-device</code>): keeps you recognized as yourself in
		your groups, for up to 400 days and renewed when you visit.
	</li>
	<li>
		<strong>Passkey check</strong> (<code>kt-passkey-challenge</code>): only while you save or use a
		passkey, for at most 5 minutes.
	</li>
	<li><strong>Language</strong>: only if you choose a language yourself.</li>
	<li>
		<strong>Your groups on this device</strong> (local storage), and a copy of pages you opened, so they
		can be viewed offline.
	</li>
</ul>
<p>
	All of these are needed for the app to work, so there is no cookie banner. Nothing is used for
	tracking or shared with anyone.
</p>

<h2>Hosting</h2>
<p>
	The app and its database run on Cloudflare (Cloudflare, Inc., USA). To deliver the pages,
	Cloudflare processes technical data such as your IP address; the app itself doesn't store it.
	Cloudflare is certified under the EU–US Data Privacy Framework.
</p>

<h2>Why (legal basis)</h2>
<p>
	The data is processed to provide the app you use (Art. 6 (1) (b) GDPR), and the technical data for
	running it securely (Art. 6 (1) (f) GDPR).
</p>

<h2>How long</h2>
<p>
	Groups and their history are kept until the group is deleted. Your identity is kept while you use
	the app. Deleted expenses stay in the group's history so they can be restored.
</p>

<h2>Deleting your data</h2>
<p>
	You can delete your identity yourself, at any time: <strong>Devices &amp; recovery</strong> →
	<strong>Delete my data</strong>. It removes your identity, passkeys, device links and recovery
	key. Your groups and their expenses stay for the others; you appear there as "not here yet", or
	under "Former member" if you choose to remove your name too.
</p>

<h2>Your rights</h2>
<p>
	You can ask for access to, correction or deletion of your data, restrict or object to its
	processing, and get it in a portable format. Contact the person responsible above. You can also
	complain to a data protection authority.
</p>

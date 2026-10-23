<script lang="ts">
	import { CONTROLLER } from '#lib/legal/controller.ts';
</script>

<p>
	Keeping Tabs soll so wenig wie möglich über dich wissen: kein Konto, kein Tracking, keine Werbung,
	keine Analyse. Hier steht, was gespeichert wird, warum, und wie du es löschen lassen kannst.
</p>

<h2>Verantwortlich</h2>
<p>{CONTROLLER.name}, {CONTROLLER.contact}</p>

<h2>Was gespeichert wird</h2>
<ul>
	<li>
		<strong>Gruppen</strong>, die du erstellst oder denen du beitrittst: Name, Beschreibung, Art und
		Farbe, die Namen der Personen darin sowie ihre Ausgaben und Zahlungen (Titel, Betrag, Datum,
		Kategorie, wer gezahlt hat und wie aufgeteilt wird). Zu jeder Gruppe wird ein Verlauf geführt,
		wer was hinzugefügt, geändert oder gelöscht hat, sichtbar für alle in der Gruppe.
	</li>
	<li>
		<strong>Du</strong>: eine zufällige Identität für dein Gerät, der Name, den du verwendest, und,
		falls eingerichtet, deine Passkeys (ihr öffentlicher Teil) und ein Wiederherstellungsschlüssel.
		Geräteschlüssel, Wiederherstellungsschlüssel und einmalige Gerätelinks werden nur als Hash
		gespeichert, nie lesbar.
	</li>
	<li>
		<strong>Importe</strong>: Wenn du einen Splitwise-Export importierst, werden seine Ausgaben und
		Zahlungen Teil der Gruppe. Die Datei selbst wird nicht aufbewahrt.
	</li>
</ul>
<p>
	Alle, die den Link einer Gruppe haben, können diese Gruppe sehen. Namen sind die einzigen
	persönlichen Daten, die du eingibst; es gibt keine E-Mail-Adressen oder Telefonnummern.
</p>

<h2>Cookies und Speicher im Browser</h2>
<ul>
	<li>
		<strong>Geräte-Identität</strong> (<code>kt-device</code>): damit du in deinen Gruppen als du
		erkannt wirst, bis zu 400 Tage, bei jedem Besuch verlängert.
	</li>
	<li>
		<strong>Passkey-Prüfung</strong> (<code>kt-passkey-challenge</code>): nur während du einen
		Passkey speicherst oder nutzt, höchstens 5 Minuten.
	</li>
	<li><strong>Sprache</strong>: nur wenn du selbst eine Sprache wählst.</li>
	<li>
		<strong>Deine Gruppen auf diesem Gerät</strong> (lokaler Speicher) und eine Kopie geöffneter Seiten,
		damit sie offline angezeigt werden können.
	</li>
</ul>
<p>
	All das ist für die App notwendig, deshalb gibt es kein Cookie-Banner. Nichts davon dient dem
	Tracking oder wird weitergegeben.
</p>

<h2>Hosting</h2>
<p>
	Die App und ihre Datenbank laufen bei Cloudflare (Cloudflare, Inc., USA). Um die Seiten
	auszuliefern, verarbeitet Cloudflare technische Daten wie deine IP-Adresse; die App selbst
	speichert sie nicht. Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert.
</p>

<h2>Warum (Rechtsgrundlage)</h2>
<p>
	Die Daten werden verarbeitet, um dir die App bereitzustellen (Art. 6 Abs. 1 lit. b DSGVO), die
	technischen Daten für einen sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).
</p>

<h2>Wie lange</h2>
<p>
	Gruppen und ihr Verlauf bleiben gespeichert, bis die Gruppe gelöscht wird. Deine Identität,
	solange du die App nutzt. Gelöschte Ausgaben bleiben im Verlauf der Gruppe, damit sie
	wiederhergestellt werden können.
</p>

<h2>Deine Rechte</h2>
<p>
	Du kannst Auskunft, Berichtigung oder Löschung deiner Daten verlangen, die Verarbeitung
	einschränken lassen oder ihr widersprechen und deine Daten in einem übertragbaren Format erhalten.
	Wende dich dazu an die oben genannte verantwortliche Person. Außerdem kannst du dich bei einer
	Datenschutz-Aufsichtsbehörde beschweren.
</p>

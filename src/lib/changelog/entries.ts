// What's new, in plain words (#212): a few lines per version for people who use the app, not
// for developers. Add the coming version's lines with each feature; they show once it's out.

import type { IconName } from '#lib/icons.ts';

export type ChangelogEntry = {
	version: string;
	/** YYYY-MM-DD; empty while it's not released */
	date: string;
	items: { icon: IconName; en: string; de: string }[];
};

/** Newest first */
export const CHANGELOG: ChangelogEntry[] = [
	{
		version: '0.18.0',
		date: '',
		items: [
			{
				icon: 'sparkles',
				en: 'New artwork: each group shows its type, in the colors of your theme. Mountains now look snowy, and Autumn takes the red.',
				de: 'Neue Bilder: Jede Gruppe zeigt ihren Typ in den Farben deines Themes. Die Berge sehen jetzt verschneit aus, und Herbst bekommt das Rot.'
			},
			{
				icon: 'locked',
				en: 'Your groups are now encrypted, including amounts. There’s nothing to do: existing groups upgrade by themselves.',
				de: 'Deine Gruppen sind jetzt verschlüsselt, auch die Beträge. Du musst nichts tun: Bestehende Gruppen stellen sich von selbst um.'
			},
			{
				icon: 'identity',
				en: 'Log out on a shared or borrowed device, without touching your account.',
				de: 'Melde dich auf einem geteilten oder geliehenen Gerät ab, ohne dein Konto anzufassen.'
			},
			{
				icon: 'phone',
				en: 'Add another device by scanning a QR code.',
				de: 'Füge ein weiteres Gerät hinzu, indem du einen QR-Code scannst.'
			},
			{
				icon: 'help',
				en: 'How it works: a short page on joining groups and keeping them when you change phones.',
				de: 'So funktioniert’s: eine kurze Seite dazu, wie du Gruppen beitrittst und sie beim Handywechsel behältst.'
			},
			{
				icon: 'toTop',
				en: 'A back-to-top button when you’ve scrolled far down a long list.',
				de: 'Ein Button zurück nach oben, wenn du in einer langen Liste weit nach unten gescrollt hast.'
			}
		]
	},
	{
		version: '0.16.0',
		date: '2026-11-01',
		items: [
			{
				icon: 'settings',
				en: 'Simpler settings: everything in one place, with your profile, devices and backup a tap away.',
				de: 'Einfachere Einstellungen: alles an einem Ort, und dein Profil, deine Geräte und dein Backup nur einen Tipp entfernt.'
			},
			{
				icon: 'photo',
				en: 'Keep a photo of the receipt with an expense.',
				de: 'Bewahre ein Foto der Rechnung bei einer Ausgabe auf.'
			},
			{
				icon: 'expense',
				en: 'Split by item: list what’s on the receipt and tick who had what. Tip and tax are shared in proportion.',
				de: 'Nach Posten aufteilen: Trag ein, was auf der Rechnung steht, und wähle, wer was hatte. Trinkgeld und Steuern werden anteilig verteilt.'
			},
			{
				icon: 'password',
				en: 'Protect a group with a password on top of its link, under Group.',
				de: 'Schütze eine Gruppe zusätzlich zum Link mit einem Passwort, unter „Gruppe“.'
			},
			{
				icon: 'payment',
				en: 'Choose your units and currency in your profile: km and litres or miles and gallons, and amounts shown in the currency you prefer.',
				de: 'Wähle in deinem Profil Einheiten und Währung: Km und Liter oder Meilen und Gallonen, und Beträge in der Währung, die du bevorzugst.'
			}
		]
	},
	{
		version: '0.15.0',
		date: '2026-11-01',
		items: [
			{
				icon: 'activity',
				en: 'An open group now shows what others add, without reloading.',
				de: 'Eine geöffnete Gruppe zeigt jetzt, was andere hinzufügen, ohne neu zu laden.'
			},
			{
				icon: 'export',
				en: 'Back up a group as a file, and restore it as a new group whenever you need it.',
				de: 'Sichere eine Gruppe als Datei und stelle sie bei Bedarf als neue Gruppe wieder her.'
			},
			{
				icon: 'categoryShopping',
				en: 'Expense categories fit the group: a car group offers fuel, parking and repairs, a shared home rent and utilities. All the others are one tap away.',
				de: 'Die Kategorien passen zur Gruppe: Eine Autogruppe bietet Sprit, Parken und Werkstatt, eine WG Miete und Nebenkosten. Alle anderen sind einen Tipp entfernt.'
			},
			{
				icon: 'note',
				en: 'Comments on expenses: ask or explain something right under an expense.',
				de: 'Kommentare zu Ausgaben: Frag oder erklär etwas direkt unter einer Ausgabe.'
			},
			{
				icon: 'kindCar',
				en: 'Car groups: note the odometer reading and the fuel with an expense, and see km driven, cost per km, consumption and the price per litre in Insights.',
				de: 'Autogruppen: Kilometerstand und Tankmenge bei einer Ausgabe eintragen und gefahrene km, Kosten pro km, Verbrauch und Literpreis in den Insights sehen.'
			}
		]
	},
	{
		version: '0.14.0',
		date: '2026-10-27',
		items: [
			{
				icon: 'edit',
				en: 'A calmer, shorter expense form: who paid and how it’s split side by side, and the save button always in reach.',
				de: 'Ein ruhigeres, kürzeres Ausgabenformular: wer bezahlt hat und wie geteilt wird nebeneinander, und der Speichern-Button immer in Reichweite.'
			},
			{
				icon: 'paidBy',
				en: 'Several people can pay one expense: choose “Several people” under “Paid by”.',
				de: 'Mehrere Leute können eine Ausgabe bezahlen: „Mehrere Leute“ unter „Bezahlt von“ wählen.'
			},
			{
				icon: 'member',
				en: 'A group can remember a split, like 60/40, for its new expenses.',
				de: 'Eine Gruppe kann sich eine Aufteilung merken, etwa 60/40, für neue Ausgaben.'
			},
			{
				icon: 'repeats',
				en: 'Expenses that repeat, like rent: choose “Every month” and they’re added on their dates.',
				de: 'Wiederkehrende Ausgaben, etwa die Miete: „Jeden Monat“ wählen, und sie kommen an ihren Tagen dazu.'
			},
			{
				icon: 'phone',
				en: 'No connection? Expenses you add wait on your phone and are sent once you’re back online.',
				de: 'Keine Verbindung? Neue Ausgaben warten auf deinem Handy und werden gesendet, sobald du wieder online bist.'
			},
			{
				icon: 'notifications',
				en: 'Notifications: turn them on in your profile to hear when someone adds an expense.',
				de: 'Benachrichtigungen: schalte sie in deinem Profil ein, um zu erfahren, wenn jemand eine Ausgabe hinzufügt.'
			},
			{
				icon: 'balances',
				en: 'Expenses in another currency: typed in yen or dollars, converted at the day’s rate.',
				de: 'Ausgaben in anderen Währungen: in Yen oder Dollar eingegeben, zum Tageskurs umgerechnet.'
			},
			{
				icon: 'sparkles',
				en: 'What’s new: this page, to see what changed.',
				de: 'Neuigkeiten: diese Seite, um zu sehen, was sich geändert hat.'
			}
		]
	},
	{
		version: '0.13.0',
		date: '2026-10-25',
		items: [
			{
				icon: 'insights',
				en: 'Insights for every group: charts over time, categories, budgets, highlights and a recap after a trip — for any year, month or day.',
				de: 'Insights für jede Gruppe: Diagramme über die Zeit, Kategorien, Budgets, Highlights und ein Rückblick nach einer Reise – für jedes Jahr, jeden Monat oder Tag.'
			},
			{
				icon: 'search',
				en: 'Search expenses, add notes to them, and see who changed what in the group’s activity.',
				de: 'Ausgaben durchsuchen, Notizen hinzufügen und in der Aktivität sehen, wer was geändert hat.'
			},
			{
				icon: 'check',
				en: 'Quicker for two: one tap for who paid and how it’s split.',
				de: 'Schneller zu zweit: ein Tipp für wer bezahlt hat und wie geteilt wird.'
			},
			{
				icon: 'payment',
				en: 'Settling up: add how to pay you, and remind people who owe you.',
				de: 'Ausgleichen: hinterlege, wie man dich bezahlt, und erinnere Leute, die dir etwas schulden.'
			},
			{
				icon: 'identity',
				en: 'Choose your avatar, copy links with one tap, and settled groups fold away.',
				de: 'Wähle deinen Avatar, kopiere Links mit einem Tipp, und ausgeglichene Gruppen werden eingeklappt.'
			},
			{
				icon: 'fast',
				en: 'Faster pages, especially in big groups.',
				de: 'Schnellere Seiten, besonders in großen Gruppen.'
			}
		]
	},
	{
		version: '0.12.0',
		date: '2026-10-24',
		items: [
			{
				icon: 'palette',
				en: 'Nine nature themes, from Forest to Aurora, each in light and dark.',
				de: 'Neun Natur-Themes, von Wald bis Polarlicht, jeweils hell und dunkel.'
			},
			{
				icon: 'balances',
				en: 'See who owes you and whom you owe, by person across all your groups.',
				de: 'Sieh, wer dir etwas schuldet und wem du etwas schuldest, pro Person über alle Gruppen.'
			},
			{
				icon: 'identity',
				en: 'Everything about you in one place: profile, settings, devices and recovery.',
				de: 'Alles über dich an einem Ort: Profil, Einstellungen, Geräte und Wiederherstellung.'
			}
		]
	},
	{
		version: '0.11.0',
		date: '2026-10-24',
		items: [
			{
				icon: 'previous',
				en: 'Undo right after deleting an expense or payment.',
				de: 'Rückgängig machen direkt nach dem Löschen einer Ausgabe oder Zahlung.'
			},
			{
				icon: 'export',
				en: 'Export a group as a spreadsheet (CSV).',
				de: 'Eine Gruppe als Tabelle (CSV) exportieren.'
			},
			{
				icon: 'accessible',
				en: 'Easier to use with a screen reader, and better contrast.',
				de: 'Besser mit Screenreader nutzbar, und mehr Kontrast.'
			}
		]
	},
	{
		version: '0.10.0',
		date: '2026-10-23',
		items: [
			{
				icon: 'language',
				en: 'The app in English or German, with your settings on all your devices.',
				de: 'Die App auf Deutsch oder Englisch, mit deinen Einstellungen auf allen Geräten.'
			},
			{
				icon: 'delete',
				en: 'Delete a group (restorable for 30 days) or your own data.',
				de: 'Eine Gruppe löschen (30 Tage wiederherstellbar) oder deine eigenen Daten.'
			},
			{
				icon: 'expense',
				en: 'Each expense shows what it means for you.',
				de: 'Jede Ausgabe zeigt, was sie für dich bedeutet.'
			}
		]
	},
	{
		version: '0.9.0',
		date: '2026-10-22',
		items: [
			{
				icon: 'kindFriends',
				en: 'The beginning: groups without signing up, expenses split equally or any way you like, categories, settling up, passkeys, an installable app, and importing from Splitwise.',
				de: 'Der Anfang: Gruppen ohne Anmeldung, Ausgaben gleich oder beliebig aufgeteilt, Kategorien, Ausgleichen, Passkeys, eine installierbare App und Import aus Splitwise.'
			}
		]
	}
];

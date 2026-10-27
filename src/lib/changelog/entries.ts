// What's new, in plain words (#212): a few lines per version for people who use the app, not
// for developers. Add the coming version's lines with each feature; they show once it's out.

export type ChangelogEntry = {
	version: string;
	/** YYYY-MM-DD; empty while it's not released */
	date: string;
	items: { en: string; de: string }[];
};

/** Newest first */
export const CHANGELOG: ChangelogEntry[] = [
	{
		version: '0.14.0',
		date: '',
		items: [
			{
				en: 'Several people can pay one expense: choose “Several people” under “Paid by”.',
				de: 'Mehrere Leute können eine Ausgabe bezahlen: „Mehrere Leute“ unter „Bezahlt von“ wählen.'
			},
			{
				en: 'A group can remember a split, like 60/40, for its new expenses.',
				de: 'Eine Gruppe kann sich eine Aufteilung merken, etwa 60/40, für neue Ausgaben.'
			},
			{
				en: 'Expenses that repeat, like rent: choose “Every month” and they’re added on their dates.',
				de: 'Wiederkehrende Ausgaben, etwa die Miete: „Jeden Monat“ wählen, und sie kommen an ihren Tagen dazu.'
			},
			{
				en: 'No connection? Expenses you add wait on your phone and are sent once you’re back online.',
				de: 'Keine Verbindung? Neue Ausgaben warten auf deinem Handy und werden gesendet, sobald du wieder online bist.'
			},
			{
				en: 'Notifications: turn them on in your profile to hear when someone adds an expense.',
				de: 'Benachrichtigungen: schalte sie in deinem Profil ein, um zu erfahren, wenn jemand eine Ausgabe hinzufügt.'
			},
			{
				en: 'Expenses in another currency: typed in yen or dollars, converted at the day’s rate.',
				de: 'Ausgaben in anderen Währungen: in Yen oder Dollar eingegeben, zum Tageskurs umgerechnet.'
			},
			{
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
				en: 'Insights for every group: charts over time, categories, budgets, highlights and a recap after a trip — for any year, month or day.',
				de: 'Insights für jede Gruppe: Diagramme über die Zeit, Kategorien, Budgets, Highlights und ein Rückblick nach einer Reise – für jedes Jahr, jeden Monat oder Tag.'
			},
			{
				en: 'Search expenses, add notes to them, and see who changed what in the group’s activity.',
				de: 'Ausgaben durchsuchen, Notizen hinzufügen und in der Aktivität sehen, wer was geändert hat.'
			},
			{
				en: 'Quicker for two: one tap for who paid and how it’s split.',
				de: 'Schneller zu zweit: ein Tipp für wer bezahlt hat und wie geteilt wird.'
			},
			{
				en: 'Settling up: add how to pay you, and remind people who owe you.',
				de: 'Ausgleichen: hinterlege, wie man dich bezahlt, und erinnere Leute, die dir etwas schulden.'
			},
			{
				en: 'Choose your avatar, copy links with one tap, and settled groups fold away.',
				de: 'Wähle deinen Avatar, kopiere Links mit einem Tipp, und ausgeglichene Gruppen werden eingeklappt.'
			},
			{
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
				en: 'Nine nature themes, from Forest to Aurora, each in light and dark.',
				de: 'Neun Natur-Themes, von Wald bis Polarlicht, jeweils hell und dunkel.'
			},
			{
				en: 'See who owes you and whom you owe, by person across all your groups.',
				de: 'Sieh, wer dir etwas schuldet und wem du etwas schuldest, pro Person über alle Gruppen.'
			},
			{
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
				en: 'Undo right after deleting an expense or payment.',
				de: 'Rückgängig machen direkt nach dem Löschen einer Ausgabe oder Zahlung.'
			},
			{
				en: 'Export a group as a spreadsheet (CSV).',
				de: 'Eine Gruppe als Tabelle (CSV) exportieren.'
			},
			{
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
				en: 'The app in English or German, with your settings on all your devices.',
				de: 'Die App auf Deutsch oder Englisch, mit deinen Einstellungen auf allen Geräten.'
			},
			{
				en: 'Delete a group (restorable for 30 days) or your own data.',
				de: 'Eine Gruppe löschen (30 Tage wiederherstellbar) oder deine eigenen Daten.'
			},
			{
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
				en: 'The beginning: groups without signing up, expenses split equally or any way you like, categories, settling up, passkeys, an installable app, and importing from Splitwise.',
				de: 'Der Anfang: Gruppen ohne Anmeldung, Ausgaben gleich oder beliebig aufgeteilt, Kategorien, Ausgleichen, Passkeys, eine installierbare App und Import aus Splitwise.'
			}
		]
	}
];

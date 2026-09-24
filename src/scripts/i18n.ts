type Locale = "de" | "en";

const STORAGE_KEY = "fabian-language";

const translations: Record<string, string> = {
  "Fabian Deragisch | Marketing, E-Commerce & Teeliebhaber": "Fabian Deragisch | Marketing, E-Commerce & Tea Enthusiast",
  "Portfolio von Fabian Deragisch: Marketing, E-Commerce und persönliche Einblicke – immer mit einer Tasse Tee in Reichweite.":
    "Fabian Deragisch's portfolio: marketing, e-commerce, and personal interests—always with a cup of tea within reach.",
  // Global navigation and recurring interface copy
  "Zum Inhalt springen": "Skip to content",
  "Direkt zum Inhalt": "Skip to content",
  "Hauptnavigation": "Main navigation",
  "Weiter zur Berufserfahrung": "Continue to work experience",
  "Berufserfahrung": "Work experience",
  "Studium + Bachelorarbeit": "Studies + bachelor's thesis",
  "Persönlich": "Personal",
  "Kontakt": "Contact",
  "Beruf": "Work",
  "Studium": "Studies",
  "Privat": "Personal",
  "Zurück": "Back",
  "Zur Website": "Back to website",
  "Öffnen": "Open",
  "Schließen": "Close",
  "Mehr erfahren": "Learn more",
  "Genauer ansehen": "View details",
  "Neu starten": "Restart",
  "Weiter": "Continue",
  "Zurück zur Website": "Back to website",
  "Impressum": "Legal notice",
  "Datenschutz": "Privacy",
  "E-Mail": "Email",
  "Telefon": "Phone",
  "Adresse": "Address",
  "Alle Rechte vorbehalten.": "All rights reserved.",
  "Direkt zu den Kontaktmöglichkeiten": "Jump to contact options",

  // Hero and profile
  "Portfolio · Wien": "Portfolio · Vienna",
  "PORTFOLIO WIEN": "PORTFOLIO VIENNA",
  "Portfolio": "Portfolio",
  "Wien": "Vienna",
  "Portfolio, Lebenslauf und ein kleiner Einblick in die Person dahinter.":
    "Portfolio, résumé, and a glimpse of the person behind it.",
  "Status": "Status",
  "Status schließen": "Close status",
  "Tee wird aufgegossen": "Tea is brewing",
  "Gerade wahrscheinlich beim Teeaufgießen.": "Probably brewing tea right now.",
  "Gerade wahrscheinlich": "Most likely",
  "Gerade": "Right now",
  "Beim ersten Sencha-Aufguss": "Brewing the first Sencha infusion",
  "beim ersten Sencha-Aufguss.": "brewing the first Sencha infusion.",
  "Beim nächsten Sencha-Aufguss": "Brewing another Sencha infusion",
  "beim nächsten Sencha-Aufguss.": "brewing another Sencha infusion.",
  "beim Teeaufgießen.": "brewing tea.",
  "Wahrscheinlich im Fitnessstudio": "Probably at the gym",
  "im Fitnessstudio.": "at the gym.",
  "Mit Musik im Ohr": "Listening to music",
  "mit Musik im Ohr.": "listening to music.",
  "Mit der Kamera unterwegs": "Out with the camera",
  "mit der Kamera unterwegs.": "out with the camera.",
  "Gerade eher offline": "Taking some time offline",
  "nicht mehr am Bildschirm.": "away from the screen.",
  "Beim Musik hören": "Listening to music",
  "Gerade läuft ziemlich sicher irgendwo Musik.": "There is almost certainly music playing somewhere right now.",
  "Auf dem Weg nach draußen": "Heading outside",
  "Wahrscheinlich gerade unterwegs oder zumindest gedanklich schon dort.":
    "Probably out and about, or at least already there in spirit.",
  "In einer Runde Karten": "Playing a round of cards",
  "Wenn Karten am Tisch liegen, dauert es meistens etwas länger.":
    "When cards hit the table, things tend to take a little longer.",
  "Fotografiert gerade": "Taking photos",
  "Unterwegs mit Kamera und einem Blick für die kleinen Dinge.":
    "Out with a camera and an eye for the little things.",
  "Gedanklich beim nächsten Projekt": "Thinking about the next project",
  "Irgendwo zwischen Idee, Notiz und erster Umsetzung.":
    "Somewhere between an idea, a note, and the first draft.",
  "Idee und Richtung: Fabian. Umsetzung im Pairing mit Codex.":
    "Idea and direction: Fabian. Built in pair programming with Codex.",
  "Von mir gedacht, mit Codex gebaut.": "Conceived by me, built with Codex.",

  // Timeline and education
  "Mein Weg bisher": "My journey so far",
  "Beruf und Studium.": "Work and studies.",
  "Marketing und Kommunikation": "Marketing and communications",
  "Studium, Schule und Abschlussarbeit": "Studies, school, and thesis",
  "August 2024 - heute": "August 2024 - present",
  "März 2022 - Februar 2024": "March 2022 - February 2024",
  "Oktober 2020 - Mai 2024": "October 2020 - May 2024",
  "Juni 2019": "June 2019",
  "Zwischen Website, SEO, Newsletter und CRM, mit Blick auf Zahlen und Gestaltung.":
    "Working across websites, SEO, newsletters, and CRM, with an eye for both data and design.",
  "SEO-Maßnahmen und Website-Content": "SEO initiatives and website content",
  "Monitoring mit Search Console und SISTRIX": "Monitoring with Search Console and SISTRIX",
  "KPI- und Performance-Reportings": "KPI and performance reporting",
  "Newsletter, CRM-Mailings und CRM-Segmente": "Newsletters, CRM mailings, and CRM segments",
  "Ein Blick dahinter": "A closer look",
  "Zur Vorderseite": "Back to front",
  "Was ich konkret mache": "What I do in practice",
  "Im Alltag wechselt es zwischen Website, Analyse, CRM und Gestaltung. Vieles entsteht im Austausch mit Kolleg:innen, einiges setze ich direkt selbst um.":
    "My day-to-day work moves between websites, analytics, CRM, and design. Much of it grows from collaboration with colleagues, while I handle other parts directly myself.",
  "SEO und Website": "SEO and website",
  "SEO-Potenziale identifizieren und Maßnahmen umsetzen, vom Content bis zu ausgewählten technischen Themen. Website-Inhalte und Kampagnen pflege ich in Magnolia.":
    "I identify SEO opportunities and implement improvements spanning content and selected technical topics. I maintain website content and campaigns in Magnolia.",
  "Monitoring und Reporting": "Monitoring and reporting",
  "Mit Google Search Console, SISTRIX und weiteren Tools beobachte ich Entwicklungen, erstelle regelmäßige KPI-Reports und präsentiere die Ergebnisse.":
    "I use Google Search Console, SISTRIX, and other tools to monitor developments, create regular KPI reports, and present the results.",
  "CRM und E-Mail": "CRM and email",
  "In Microsoft Dynamics baue ich Segmente sowie CRM-Mailings und kümmere mich um das Newsletter-Marketing.":
    "In Microsoft Dynamics, I build segments and CRM mailings and manage newsletter marketing.",
  "Gestaltung und Austausch": "Design and collaboration",
  "Grafiken und weitere Medien erstelle ich selbst und stimme Kampagnen mit den beteiligten Kolleg:innen ab.":
    "I create graphics and other media and coordinate campaigns with the colleagues involved.",
  "Digitale Kommunikation, redaktionelle Website-Arbeit und Gestaltung für unterschiedliche interne und externe Berührungspunkte.":
    "Digital communications, editorial website work, and design across a range of internal and external touchpoints.",
  "Homepages, Unterseiten und SEO": "Homepages, landing pages, and SEO",
  "Social Media, Flyer und Plakate": "Social media, flyers, and posters",
  "Stellenanzeigen und Mitarbeiterkommunikation": "Job postings and employee communications",
  "Mitwirkung an einer Mitarbeiter-Info-App": "Contributing to an employee information app",
  "Marketingpraxis im Studium": "Hands-on marketing during my studies",
  "Während meines Bachelorstudiums arbeitete ich als Werkstudent in der externen Kommunikation und im Marketing.":
    "During my bachelor's degree, I worked as a student employee in external communications and marketing.",
  "Recruiting": "Recruiting",
  "Stellenanzeigen für Printmedien, Indeed, Ärztestellen und weitere passende Kanäle planen und publizieren.":
    "Planning and publishing job advertisements for print media, Indeed, medical job boards, and other suitable channels.",
  "Budget": "Budget",
  "Geeignete Medien auswählen und bei der Schaltung von Stellenanzeigen mit einem festen Budget arbeiten.":
    "Selecting suitable media and working within a fixed budget when placing job advertisements.",
  "Website und SEO": "Website and SEO",
  "Seiten und Unterseiten erstellen, Inhalte pflegen und erste SEO-Aufgaben übernehmen.":
    "Creating pages and subpages, maintaining content, and taking on initial SEO tasks.",
  "Mitarbeiter-App": "Employee app",
  "An Layout, Inhalten und Funktionen einer internen Mitarbeiter-Info-App mitarbeiten.":
    "Contributing to the layout, content, and features of an internal employee information app.",
  "Mitarbeiter im Marketing und E-Commerce": "Marketing & E-Commerce Specialist",
  "Werkstudent externe Kommunikation und Marketing":
    "Working Student, External Communications & Marketing",
  "Parallel zum Bachelorstudium": "Alongside my bachelor's degree",
  "Medien und Kommunikation (B. A.)": "Media and Communication (B.A.)",
  "Medien und Kommunikation (B.A.)": "Media and Communication (B.A.)",
  "Medien und Kommunikation": "Media and Communication",
  "Allgemeine Hochschulreife in Bayern.": "General university entrance qualification in Bavaria.",
  "Logo der DERTOUR Austria GmbH": "DERTOUR Austria GmbH logo",
  "Logo der Landkreis Passau Gesundheitseinrichtungen": "Landkreis Passau Gesundheitseinrichtungen logo",
  "Logo der Universität Passau": "University of Passau logo",
  "Logo des Adalbert-Stifter-Gymnasiums Passau": "Adalbert-Stifter-Gymnasium Passau logo",
  "Was im Studium zusammenkam": "What came together during my studies",
  "Kommunikationswissenschaft im Mittelpunkt, ergänzt durch Einblicke in Wirtschaft und Informatik.":
    "Communication studies at the centre, complemented by perspectives from business and computer science.",
  "Theorien, Modelle und Forschung zu Medien, Kommunikation und öffentlicher Verständigung.":
    "Theories, models, and research on media, communication, and public discourse.",
  "Zusatzmodule": "Additional modules",
  "Ergänzende Grundlagen aus Wirtschaft und Informatik.": "Additional foundations in business and computer science.",
  "Abschlussarbeit über die Zusammenarbeit von KI und Kunst, mit Blick auf Potenziale und kritische Fragen.":
    "A thesis on collaboration between AI and art, examining both its potential and its critical questions.",
  "Davor: BAE": "Before that: BAE",
  "2019 begann ich mit Business Administration & Economics und wechselte nach zwei Semestern zu Medien und Kommunikation.":
    "I began studying Business Administration & Economics in 2019 before switching to Media and Communication after two semesters.",
  "Bachelor of Arts · Abschluss 2024": "Bachelor of Arts · Graduated in 2024",
  "Universität Passau": "University of Passau",
  "Bachelorstudium mit Schwerpunkten in Medien, Kommunikation und digitaler Öffentlichkeit. 2024 mit der Gesamtnote 2,3 abgeschlossen.":
    "Bachelor's degree focused on media, communication, and the digital public sphere. Graduated in 2024 with an overall German grade of 2.3.",
  "Abitur": "German Abitur",
  "Allgemeine Hochschulreife": "General university entrance qualification",
  "Schulabschluss am Auersperg-Gymnasium Passau": "Graduated from Auersperg-Gymnasium Passau",
  "Bachelorarbeit": "Bachelor's thesis",
  "Abschluss im Bachelorstudium": "Final bachelor's project",
  "Bachelorarbeit: Kreative Synergien.": "Bachelor's thesis: Creative Synergies.",
  "Kreative Synergien: Die Zukunft der Zusammenarbeit von KI und Künstlern":
    "Creative Synergies: The Future of Collaboration Between AI and Artists",
  "Die Bachelorarbeit beschäftigt sich mit der Frage, wie KI und künstlerische Praxis zusammenwirken können und welche Zukunftsbilder daraus für kreative Zusammenarbeit entstehen.":
    "The thesis examines how AI and artistic practice can work together and what visions this creates for the future of creative collaboration.",
  "Angaben zur Bachelorarbeit": "Thesis details",
  "B.A. Medien und Kommunikation": "B.A. Media and Communication",
  "Universität Passau · 2024": "University of Passau · 2024",
  "Bachelorarbeit in der Leseansicht öffnen": "Open bachelor's thesis in reader view",
  "In der Leseansicht öffnen": "Open reader view",
  "KI trifft kreative Praxis.": "AI meets creative practice.",
  "KI trifft": "AI meets",
  "kreative Praxis.": "creative practice.",
  "Die Arbeit in Kürze": "The thesis in brief",
  "Was aus der Arbeit bleibt.": "What the research revealed.",
  "Arbeit lesen": "Read thesis",
  "Vorderseite": "Front",
  "Herangehensweise": "Approach",
  "Literatur zu Kreativität, KI, Urheberrecht und drei konkreten Tools trifft auf fünf leitfadengestützte Experteninterviews und eine qualitative Inhaltsanalyse mit MAXQDA.":
    "Research on creativity, AI, copyright, and three specific tools is combined with five semi-structured expert interviews and a qualitative content analysis in MAXQDA.",
  "Ko-Kreativität statt Ersatz": "Co-creativity instead of replacement",
  "Das stärkste Zukunftsmodell ist die Zusammenarbeit: KI gibt Impulse und erleichtert Schritte, während Menschen Bedeutung, Auswahl und Richtung bestimmen.":
    "The strongest model for the future is collaboration: AI provides impulses and simplifies steps, while people determine meaning, selection, and direction.",
  "Neue kreative Zugänge": "New creative pathways",
  "Schnelleres Experimentieren, stärker individualisierte Ergebnisse und ein einfacherer Einstieg können neue Formen von Kunst und neues Interesse daran ermöglichen.":
    "Faster experimentation, more individual results, and lower barriers to entry can enable new forms of art and spark fresh interest in it.",
  "Die kritische Seite": "The critical side",
  "Urheberrecht, Kennzeichnung und Trainingsdaten bleiben ebenso offen wie Missbrauch, Leistungsdruck und die Frage, ob Einzigartigkeit und Emotion verloren gehen.":
    "Copyright, disclosure, and training data remain unresolved, as do misuse, performance pressure, and the question of whether uniqueness and emotion may be lost.",
  "Die Untersuchung im Überblick": "The study at a glance",
  "Thema": "Topic",
  "Methode": "Method",
  "Ergebnis": "Finding",
  "Note": "Grade",
  "Zur Bachelorarbeit": "View bachelor's thesis",
  "Arbeit ansehen": "View thesis",
  "Bachelorarbeit öffnen": "Open bachelor's thesis",
  "Forschungsfrage": "Research question",
  "Forschungsdesign": "Research design",
  "Auswertung": "Analysis",
  "Fazit": "Conclusion",
  "Quellen": "Sources",

  // Personal section: photography, tea, vinyl, cards
  "Fotografie": "Photography",
  "Fotografieren": "Photography",
  "Momente, Licht und Perspektiven": "Moments, light, and perspectives",
  "Die Kamera ist für mich ein Werkzeug zum bewussteren Hinsehen.":
    "For me, the camera is a way to look more closely.",
  "Galerie ansehen": "View gallery",
  "Eine kleine Auswahl meiner Fotos. Mehr davon liegt in der Galerie, und die wächst weiter.":
    "A small selection of my photos. There are more in the gallery, and the collection keeps growing.",
  "Über die Kamera": "About the camera",
  "Meine Kamera": "My camera",
  "Kompakt und bewusst analog bedienbar": "Compact, with deliberate analogue controls",
  "Die spiegellose X-T30 III wiegt 378 Gramm und kombiniert einen 26,1-Megapixel-Sensor mit Fujifilms aktuellem X-Processor 5.":
    "The mirrorless X-T30 III weighs 378 grams and combines a 26.1-megapixel sensor with Fujifilm's current X-Processor 5.",
  "Das Ergebnis schon vor dem Auslösen sehen": "See the result before pressing the shutter",
  "Zwanzig Looks direkt in der Kamera": "Twenty looks straight from the camera",
  "Spiegellos": "Mirrorless",
  "Kamerafakt auswählen": "Choose a camera fact",
  "Galerie öffnen": "Open gallery",
  "Gespeichert": "Saved",
  "Fotogalerie steuern": "Gallery controls",
  "Vorheriges Foto": "Previous photo",
  "Nächstes Foto": "Next photo",
  "Foto auslösen": "Take photo",
  "Foto aufgenommen. Das angezeigte Galeriebild bleibt unverändert.":
    "Photo taken. The displayed gallery image remains unchanged.",
  "Wiedergabe": "Playback",
  "Filmsimulation auswählen": "Choose film simulation",
  "Filmsimulation": "Film simulation",
  "Schwarz-Weiß-Aufnahme eines DJ-Sets bei Radio Rudina mit Publikum und Discokugel":
    "Black-and-white photograph of a DJ set at Radio Rudina with an audience and disco ball",
  "Kamera ausprobieren": "Try the camera",
  "Kamera schließen": "Close camera",
  "Kameramodul": "Camera module",
  "Kamera": "Camera",
  "Auslösen": "Take photo",
  "Bild aufnehmen": "Take photo",
  "Noch kein Foto aufgenommen.": "No photo taken yet.",
  "Vorschau": "Preview",
  "Einstellungen": "Settings",
  "Blende": "Aperture",
  "Belichtungszeit": "Shutter speed",
  "Film": "Film",
  "Brennweite": "Focal length",
  "Automatisch": "Auto",
  "Manuell": "Manual",
  "Tee": "Tea",
  "MEIN TÄGLICHES RITUAL": "MY DAILY RITUAL",
  "Mein tägliches Ritual": "My daily ritual",
  "Grüner Tee": "Green tea",
  "Grüner Tee.": "Green tea.",
  "Meist chinesischer Sencha, gern auch andere Grüntees: lose Blätter, eine ganze Kanne und mehrere Aufgüsse.":
    "Usually Chinese Sencha, with other green teas mixed in: loose leaves, a full pot, and several infusions.",
  "Chinesischer Sencha": "Chinese Sencha",
  "Mein Favorit": "My favourite",
  "Frisch, grasig, klar": "Fresh, grassy, clean",
  "Mein Tee für fast jeden Tag – und der, zu dem ich am häufigsten greife.":
    "My tea for almost every day—and the one I reach for most often.",
  "Grüntee-Sorte auswählen": "Choose a green tea",
  "Jasmin": "Jasmine",
  "Tipp zum Aufguss": "Brewing tip",
  "Mit etwa 75 bis 80 °C aufgießen und ruhig ein zweites oder drittes Mal Wasser nachgießen.":
    "Brew at around 75 to 80°C, then feel free to infuse the leaves a second or third time.",
  "Nächste Teesorte ansehen": "View the next tea",
  "Jasmin-Grüntee": "Jasmine green tea",
  "Floral": "Floral",
  "Duftig, leicht, weich": "Fragrant, light, soft",
  "Meine leichtere, floralere Alternative zu Sencha.": "My lighter, more floral alternative to Sencha.",
  "Nicht zu heiß aufgießen, damit der Jasmin fein bleibt und der Tee nicht unnötig bitter wird.":
    "Keep the water below boiling so the jasmine stays delicate and the tea does not turn unnecessarily bitter.",
  "Geröstet": "Roasted",
  "Nussig, warm, mild": "Nutty, warm, mild",
  "Grüntee mit geröstetem Reis – mild und deutlich wärmer im Geschmack.":
    "Green tea with roasted rice—mild, with a distinctly warmer flavour.",
  "Rund 80 °C reichen meist aus. Genmaicha passt außerdem überraschend gut zu herzhaftem Essen.":
    "Around 80°C is usually enough. Genmaicha also pairs surprisingly well with savoury food.",
  "Zeit für eine gute Tasse": "Time for a good cup",
  "Ein kleines Ritual zwischen Alltag und Ruhe.": "A small ritual between everyday life and a quiet moment.",
  "Tee-Reise starten": "Start the tea journey",
  "Musik": "Music",
  "Musik, manchmal mit Seitenwechsel.": "Music, sometimes with a side change.",
  "Plattenspieler starten oder stoppen": "Start or stop the turntable",
  "Durch die Platten blättern": "Browse records",
  "Vorherige Platten anzeigen": "Show previous records",
  "Weitere Platten anzeigen": "Show more records",
  "Album auswählen": "Choose an album",
  "Musik gehört bei mir eigentlich immer dazu. Meistens über Spotify, manchmal auf Vinyl. An Platten mag ich, dass ich bei einem Album eher dranbleibe und genauer zuhöre. Gerade bei Konzeptalben macht das Spaß.":
    "Music is almost always part of my day. Usually through Spotify, sometimes on vinyl. Records make me stay with an album and listen more closely, which is especially rewarding with concept albums.",
  "Auf Spotify hören": "Listen on Spotify",
  "Meine Favoriten": "My favourites",
  "Platten auswählen": "Choose a record",
  "Spiele ich gern": "I enjoy playing",
  "Spielkarten": "Playing cards",
  "Bei einer Runde Karten bin ich fast immer dabei. Am liebsten Durak, Neunerln oder Poker.":
    "I am almost always up for a round of cards—especially Durak, Neunerln, or Poker.",
  "Angreifen, verteidigen, Trumpf im Blick behalten. Verloren hat, wer am Ende noch Karten hält.":
    "Attack, defend, and keep an eye on trumps. Whoever is left holding cards loses.",
  "Spielbar gegen Bots": "Play against bots",
  "Vier Spiele": "Four games",
  "Eine echte Runde starten": "Start a real round",
  "Gegen taktische Bots · ohne Anmeldung": "Against tactical bots · no sign-up",
  "Karten anfassen und verschieben": "Pick up and move the cards",
  "Kartenspiel auswählen": "Choose a card game",
  "Durak starten": "Start Durak",
  "Arschloch starten": "Start President",
  "Neunerln starten": "Start Neunerln",
  "Poker starten": "Start poker",
  "Spielvorschau": "Game preview",
  "Die Karten können bewegt oder neu gemischt werden.": "The cards can be moved or shuffled again.",
  "Dame Herz bewegen": "Move queen of hearts",
  "Ass Kreuz bewegen": "Move ace of clubs",
  "Zehn Karo bewegen": "Move ten of diamonds",
  "König Pik bewegen": "Move king of spades",
  "Neun Herz bewegen": "Move nine of hearts",
  "Neu mischen": "Shuffle again",
  "Bewegliche Spielkarten": "Movable playing cards",
  "Durak spielen": "Play Durak",
  "Arschloch spielen": "Play President",
  "Neunerln spielen": "Play Neunerln",
  "Poker spielen": "Play poker",
  "Arschloch": "President",

  // Gallery
  "Galerie": "Gallery",
  "Favorite Shots – Fotogalerie von Fabian Deragisch": "Favorite Shots – photography by Fabian Deragisch",
  "Galerie verlassen und zur Website zurückkehren": "Leave the gallery and return to the website",
  "Interaktive Fotogalerie. Mit Pfeiltasten, Wischen oder Mausrad navigieren.":
    "Interactive photo gallery. Navigate with the arrow keys, a swipe, or the mouse wheel.",
  "Ausgewählte Fotografien": "Selected photographs",
  "Ein Blick durch meine Kamera": "Through my lens",
  "Vorheriges Bild": "Previous image",
  "Nächstes Bild": "Next image",
  "Bild schließen": "Close image",
  "Bild vergrößern": "Enlarge image",
  "Abseits der Arbeit.": "Beyond work.",
  "Abseits der Arbeit": "Beyond work",
  "Abseits der": "Beyond",
  "Arbeit.": "work.",
  "Interessen, Empfehlungen und kleine Dinge zum Ausprobieren.":
    "Interests, recommendations, and small things to try.",
  "Persönliche Interessen": "Personal interests",
  "Training": "Training",
  "Motivation ist nicht jeden Tag da. Hingehen und anfangen funktioniert meistens trotzdem.":
    "Motivation is not there every day. Showing up and getting started usually works anyway.",
  "Nächsten Trainingssatz starten": "Start the next training set",
  "Satz für Satz": "Set by set",
  "Aufwärmen": "Warm-up",
  "0 von 3": "0 of 3",
  "1 von 3": "1 of 3",
  "2 von 3": "2 of 3",
  "3 von 3": "3 of 3",
  "Noch kein Satz gestartet.": "No set started yet.",
  "Warum Krafttraining?": "Why strength training?",
  "Trainingsfakt auswählen": "Choose a training fact",
  "Knochen": "Bones",
  "Nerven": "Nervous system",
  "Rhythmus": "Rhythm",
  "Erster Satz abgeschlossen.": "First set completed.",
  "Zweiter Satz abgeschlossen.": "Second set completed.",
  "Dritter Satz abgeschlossen.": "Third set completed.",
  "Sätze zurückgesetzt.": "Sets reset.",
  "Arbeitssatz": "Working set",
  "Letzter Satz": "Final set",
  "Kleines Minigame. Kurz abschalten.": "A small mini-game. Take a short break.",
  "Kleines Minigame.": "A small mini-game.",
  "Kurz abschalten.": "Take a short break.",
  "15 Sekunden, eine Tasse Tee und ein paar kleine Umwege.":
    "15 seconds, a cup of tea, and a few small detours.",
  "Tea Trail spielen": "Play Tea Trail",
  "Mit einer Tasse Tee durch mein kleines Gartenatelier: der Start von Tea Trail.":
    "A cup of tea through my small garden studio: the opening of Tea Trail.",

  // Card room shell
  "Eine Runde Karten | Fabian Deragisch": "A round of cards | Fabian Deragisch",
  "Durak, Arschloch, Neunerln und Texas Hold’em gegen taktische Bots spielen. Ohne Echtgeld.":
    "Play Durak, President, Neunerln, and Texas Hold'em against tactical bots. No real money.",
  "Spielzimmer": "Card room",
  "SPIELZIMMER": "CARD ROOM",
  "Eine Runde geht immer.": "There is always time for one more round.",
  "Spielregeln": "Rules",
  "Spielregeln öffnen": "Open rules",
  "Spielregeln schließen": "Close rules",
  "Spieltisch": "Card table",
  "Hier werden Karten abgelegt": "Cards are played here",
  "Deine Karten und Aktionen": "Your cards and actions",
  "Karten zum Sortieren verschieben · antippen zum Auswählen":
    "Drag to reorder · tap to select",
  "Zum Sortieren verschieben · Alt + Pfeiltasten verschiebt die Karte":
    "Drag to reorder · Alt + arrow keys move the card",
  "Zum Spielen bitte JavaScript aktivieren.": "Please enable JavaScript to play.",
  "Verlauf schließen": "Close history",
  "Am Tisch passiert": "At the table",
  "Neue Runde anfangen?": "Start a new round?",
  "Die laufende Partie wird beendet.": "The current game will end.",
  "Neu beginnen": "Start over",
  "Deine Hand": "Your hand",
  "Deine Karten": "Your cards",
  "Dein Zug": "Your turn",
  "Gegner ist am Zug": "Opponent's turn",
  "Spielverlauf": "Game history",
  "Gute Karten. Gute Gesellschaft.": "Good cards. Good company.",
  "Ohne Konto · ohne Echtgeld": "No account · no real money",
  "Nur Spielchips": "Play chips only",
  "Karte auswählen": "Choose a card",
  "Karten auswählen": "Choose cards",
  "Karte spielen": "Play card",
  "Karten spielen": "Play cards",
  "Karte ziehen": "Draw a card",
  "Ziehen": "Draw",
  "Passen": "Pass",
  "Aufnehmen": "Pick up",
  "Angriff beenden": "End attack",
  "Angriff schieben": "Transfer attack",
  "Decken": "Cover",
  "Angreifen": "Attack",
  "Nachwerfen": "Add a card",
  "Aufnehmen lassen": "Let opponent pick up",
  "Ablegen": "Discard",
  "Auf den Tisch klopfen": "Knock on the table",
  "Checken": "Check",
  "Setzen": "Bet",
  "Abbrechen": "Cancel",
  "Einsatz erhöhen": "Raise the bet",
  "Gesamteinsatz wählen": "Choose total bet",
  "Diese Auswahl passt nicht": "This selection is not valid",
  "Bitte einen gültigen Zug wählen.": "Please choose a valid move.",
  "Dieser Zug ist nicht erlaubt.": "This move is not allowed.",
  "Ungültige Erhöhung.": "Invalid raise.",
  "Schieben": "Transfer",
  "Klopfen": "Knock",
  "Farbe wählen": "Choose a suit",
  "Aussetzen": "Skip",
  "Mitgehen": "Call",
  "Erhöhen": "Raise",
  "Erhöhen auf": "Raise to",
  "All-in": "All-in",
  "Aussteigen": "Fold",
  "Check": "Check",
  "Weiter spielen": "Keep playing",
  "Neue Runde": "New round",
  "Nochmal spielen": "Play again",
  "Runde beendet": "Round over",
  "Gewonnen": "You won",
  "Verloren": "You lost",
  "Du hast gewonnen": "You won",
  "Du hast verloren": "You lost",
  "Unentschieden": "Draw",
  "Du gewinnst": "You win",
  "Du verlierst": "You lose",
  "Muss passen.": "Have to pass.",
  "Ich passe.": "I pass.",
  "Keine passende Karte.": "No matching card.",
  "Das wird knapp.": "This is getting close.",
  "Nicht schlecht.": "Not bad.",
  "Guter Zug.": "Good move.",
  "Na dann.": "Here we go.",
  "Mal sehen …": "Let's see …",
  "Einen Moment …": "One moment …",
  "Die passt.": "That works.",
  "Den nehme ich.": "I'll take that.",
  "So war das nicht geplant.": "That was not the plan.",
  "Jetzt wird es interessant.": "Now it gets interesting.",
  "Ziehe zum Sortieren · Karte antippen zum Auswählen":
    "Drag to reorder · tap a card to select it",
  "Ziehe Karten frei an die gewünschte Position.": "Drag cards into any order you like.",
  "Lege eine Karte": "Play a card",
  "Decken, schieben oder aufnehmen": "Cover, transfer, or pick up",
  "Decken oder aufnehmen": "Cover or pick up",
  "Nachlegen oder beenden": "Add another card or finish",
  "Wähle eine Karte zum Zurückgeben": "Choose a card to give back",
  "Lege eine Karte oder mehrere gleiche Werte": "Play one card or several of the same rank",
  "Höhere Karte antippen": "Tap a higher card",
  "Keine höhere Karte – passen": "No higher card—pass",
  "Zwei gleiche höhere Karten antippen": "Tap two matching higher cards",
  "Kein höheres Paar auf der Hand – passen": "No higher pair in hand—pass",
  "Drei gleiche höhere Karten antippen": "Tap three matching higher cards",
  "Kein höherer Drilling – passen": "No higher three of a kind—pass",
  "Vier gleiche höhere Karten antippen": "Tap four matching higher cards",
  "Kein höherer Vierling – passen": "No higher four of a kind—pass",
  "Klopfen vergessen: erst Strafkarten ziehen": "Missed the knock: draw penalty cards first",
  "Geklopft. Jetzt Karte ablegen.": "Knocked. Now play a card.",
  "Vor der vorletzten Karte klopfen": "Knock before playing your second-to-last card",
  "Lege dieselbe Farbe oder denselben Wert": "Play the same suit or rank",
  "Wähle deine Aktion": "Choose your action",
  "Farbe": "Suit",
  "Lege passende Karten": "Play matching cards",
  "Wähle deinen Einsatz": "Choose your bet",
  "Wähle eine Farbe": "Choose a suit",
  "Deine Chips": "Your chips",
  "Gemeinschaftskarten": "Community cards",
  "Pot": "Pot",
  "Dealer": "Dealer",
  "Du": "You",
  "Höchste Karte": "High card",
  "Hohe Karte": "High card",
  "Paar": "Pair",
  "Zwei Paare": "Two pair",
  "Drilling": "Three of a kind",
  "Straße": "Straight",
  "Vierling": "Four of a kind",
  "Trumpf": "Trump",
  "Nachziehstapel": "Draw pile",
  "Ablagestapel": "Discard pile",
  "Stapel": "Pile",
  "Freies Ausspiel": "Open lead",
  "Angriff": "Attack",
  "Verteidigung": "Defence",
  "Die Runde beginnt.": "The round begins.",
  "Du eröffnest.": "You lead.",
  "Du greifst an.": "You attack.",
  "Du verteidigst.": "You defend.",
  "Angreifen oder Angriff beenden": "Attack or end the attack",
  "Passende Karte auswählen und ausspielen.": "Choose and play a matching card.",
  "Eine Karte oder mehrere gleiche Werte wählen, dann ausspielen.":
    "Choose one card or several cards of the same rank, then play them.",
  "Deine beiden Karten bleiben für die anderen verdeckt.":
    "Your two cards remain hidden from the others.",
  "Texas Hold’em · Duell": "Texas Hold’em · Heads-up",
  "Viererrunde · 52 Karten": "Four players · 52 cards",
  "Duell · 36 Karten": "Heads-up · 36 cards",
  "6 bis Ass": "6 through ace",
  "Herz": "Hearts",
  "Karo": "Diamonds",
  "Kreuz": "Clubs",
  "Pik": "Spades",
  "Wähle Herz": "Choose hearts",
  "Wähle Karo": "Choose diamonds",
  "Wähle Kreuz": "Choose clubs",
  "Wähle Pik": "Choose spades",
  "B": "J",
  "D": "Q",
  "Noch verdeckte Gemeinschaftskarte": "Face-down community card",
  "Ohne Showdown": "Without showdown",
  "Showdown": "Showdown",
  "Stapel leer. Die kleinste Hand gewinnt.": "The pile is empty. The smallest hand wins.",
  "Unentschieden. Beide Hände sind leer.": "Draw. Both hands are empty.",
  "Gleichstand. Der Pot wird geteilt.": "Tie. The pot is split.",
  "Du bist ausgestiegen.": "You folded.",
  "Du eröffnest. Einzelkarte oder gleichrangige Gruppe auswählen.":
    "You lead. Choose a single card or a group of matching ranks.",
  "Du beginnst. Gleiche Farbe oder gleicher Wert.": "You begin. Match the suit or rank.",
  "Die letzte Karte ist weg.": "The final card is gone.",
  "Karte zurückgeben": "Give a card back",
  "Ausspielen": "Play",
  "Der Stapel ist leer.": "The pile is empty.",
  "Kartentausch": "Card exchange",
  "Verteidigen oder aufnehmen": "Defend or pick up",
  "Nachwerfen oder abschließen": "Add a card or finish",
  "Blinds 10 / 20. Der Button beginnt vor dem Flop.": "Blinds 10 / 20. The button acts first before the flop.",
  "Passt hier ganz gut.": "This fits nicely.",
  "Die nehm ich.": "I'll take this one.",
  "Probieren wir die.": "Let's try this one.",
  "Bin diesmal raus.": "I'm out this time.",
  "Weiter ohne mich.": "Carry on without me.",
  "Die ist gedeckt.": "Covered.",
  "Geht sich aus.": "That works.",
  "Abgewehrt.": "Defended.",
  "Dann nehm ich sie.": "Then I'll take them.",
  "Okay, die gehen an mich.": "Okay, they're mine.",
  "Muss ich wohl aufnehmen.": "Looks like I have to pick them up.",
  "Zurück zu dir.": "Back to you.",
  "Den schieb ich weiter.": "I'll pass that attack on.",
  "Gleicher Wert – du bist dran.": "Same rank—your turn.",
  "Ich checke.": "I check.",
  "Von mir aus weiter.": "Fine by me.",
  "Ich bleib ruhig.": "I'll stay calm.",
  "Ich geh mit.": "I call.",
  "Das zahl ich.": "I'll call that.",
  "Bin dabei.": "I'm in.",
  "Die Hand geb ich ab.": "I'm letting this hand go.",
  "Das wird mir zu heiß.": "Too hot for me.",
  "Ich bin raus.": "I'm out.",
  "Das sollte reichen.": "That should do it.",
  "Sauber abgelegt.": "Nicely played.",
  "Genau die.": "That exact one.",
  "Keine passende Antwort.": "No suitable answer.",
  "Ich passe diesmal.": "I'll pass this time.",
  "Da geh ich nicht drüber.": "I can't beat that.",
  "Korrekt gedeckt.": "Properly covered.",
  "Der Angriff ist abgewehrt.": "Attack defended.",
  "Gelöst.": "Sorted.",
  "Keine Deckung. Ich nehme.": "Can't cover. I'll pick up.",
  "Dann eben aufnehmen.": "Picking them up, then.",
  "Die Rechnung geht nicht auf.": "The numbers don't work.",
  "Weitergeschoben.": "Transferred.",
  "Der kommt zurück.": "Sending it back.",
  "Passender Wert. Du deckst.": "Matching rank. You defend.",
  "Check.": "Check.",
  "Noch kein Grund zu setzen.": "No reason to bet yet.",
  "Ich schau mir die nächste an.": "I'll see the next card.",
  "Ich gleiche aus.": "I call.",
  "Mitgegangen.": "Called.",
  "Die Quote passt.": "The odds work.",
  "Nicht gut genug.": "Not good enough.",
  "Ich steige aus.": "I fold.",
  "Die Rechnung passt nicht.": "The maths doesn't work.",
  "Und weg damit.": "And away it goes.",
  "Die macht sich gut hier.": "That looks good here.",
  "Bitte sehr.": "There you go.",
  "Na gut, ich passe.": "All right, I pass.",
  "Dann eben später.": "Maybe later, then.",
  "Ausnahmsweise passe ich.": "I'll pass for once.",
  "Erwischt? Wohl kaum.": "Caught me? Hardly.",
  "Schön gedeckt.": "Nicely covered.",
  "Nicht mit mir.": "Not with me.",
  "Autsch. Die nehm ich.": "Ouch. I'll take them.",
  "Geschenkt ist geschenkt.": "A gift is a gift.",
  "Okay, alle zu mir.": "Okay, all of them are mine.",
  "Nicht so schnell – zurück.": "Not so fast—back to you.",
  "Den darfst du selbst decken.": "You can cover that yourself.",
  "Schieben kann ich auch.": "I can transfer too.",
  "Mal sehen, was kommt.": "Let's see what comes next.",
  "Noch halte ich still.": "I'll hold for now.",
  "Ich will es sehen.": "I want to see it.",
  "Da geh ich mit.": "I'll call that.",
  "Komm, zeig her.": "Come on, show me.",
  "Für heute genug Mut.": "Enough bravery for today.",
  "Die schenk ich dir.": "You can have this one.",
  "Ich greife an.": "I attack.",
  "Gedeckt.": "Covered.",
  "Ich nehme auf.": "I'll pick up.",
  "Fertig.": "Done.",
  "Ich gehe mit.": "I call.",
  "Die ist für dich.": "This one is for you.",
  "Klopf, klopf.": "Knock, knock.",
  "Klopfen vergessen!": "Forgot to knock!",
  "Mein Zug.": "My move.",
  "Ich ziehe eine.": "I'll draw one.",
  "Alles rein. All-in!": "Everything in. All-in!",
  "Der Angriff ist vorbei.": "The attack is over.",
  "Die lege ich vor.": "I'll lead with this.",
  "Paar. Bitte sehr.": "A pair. There you go.",
  "Zwei auf einmal.": "Two at once.",
  "Mein Paar.": "My pair.",
  "Ein Drilling für euch.": "Three of a kind for you.",
  "Vier Stück. Viel Spaß.": "Four of them. Have fun.",
  "Die lege ich.": "I'll play this one.",
  "+2. Tut mir leid.": "+2. Sorry.",
  "Du setzt eine Runde aus.": "You miss a turn.",
  "Na toll. Ich setze aus.": "Great. I miss a turn.",
  "Nur noch eine.": "Only one left.",
  "Eine hab ich noch.": "I have one left.",
  "Letzte Karte!": "Last card!",
  "Mitgegangen. All-in.": "Called. All-in.",

  // Contact and footer
  "Einfach Hallo sagen.": "Just say hello.",
  "E-Mail, LinkedIn oder Instagram.": "Email, LinkedIn, or Instagram.",
  "Kontaktwege": "Contact options",
  "Kontaktweg wählen. Die Taube übernimmt den Rest.": "Choose a contact route. The pigeon will take it from here.",
  "Los": "Start",
  "Postfach": "Inbox",
  "Meine Idee. Mein Feinschliff. Mit Codex umgesetzt.": "My idea. My finishing touches. Built with Codex.",
  "Kein Tracking. Keine Werbung. Keine Cookies durch diese Website.":
    "No tracking. No ads. No cookies set by this website.",
  "Rechtliche Hinweise": "Legal information",

  // Rules dialogs
  "So spielst du": "How to play",
  "Ziel": "Goal",
  "So legst du ab": "How to discard",
  "Die Sonderkarten": "Action cards",
  "Unsere Hausregeln": "House rules",
  "Lege als Erster deine letzte Karte ab.": "Be the first to play your final card.",
  "Fünf Startkarten. Lege dieselbe Farbe oder denselben Wert wie die oberste Karte.":
    "Start with five cards. Play the same suit or rank as the top card.",
  "Eine 9 darfst du auf jede Karte legen – außer bei einer offenen Ziehstrafe. Wähle anschließend die nächste Farbe.":
    "You may play a 9 on any card—except while a draw penalty is active. Then choose the next suit.",
  "Nichts passt? Ziehe eine Karte. Passt sie, darfst du sie direkt legen; sonst geht es weiter.":
    "Nothing fits? Draw a card. If it fits, you may play it immediately; otherwise the turn passes on.",
  "7: Der nächste Spieler zieht zwei. Eine weitere 7 gibt die Strafe weiter und erhöht sie um zwei.":
    "7: The next player draws two. Another 7 passes the penalty on and adds two more cards.",
  "8: Der nächste Spieler setzt eine Runde aus.": "8: The next player misses a turn.",
  "9: Wünsche dir die Farbe für den nächsten Zug.": "9: Choose the suit for the next turn.",
  "Vor deiner vorletzten Karte musst du klopfen. Vergessen kostet zwei Strafkarten.":
    "Knock before playing your second-to-last card. Forgetting costs two penalty cards.",
  "Jede übrige Handkarte zählt einen Minuspunkt. Ein Abschluss mit einer 9 verdoppelt die Minuspunkte der anderen.":
    "Each card left in hand counts as one penalty point. Finishing with a 9 doubles everyone else's penalty points.",
  "Schlage die Angriffskarten oder schiebe den Angriff weiter. Wer am Ende noch Karten hält, ist der Durak.":
    "Beat the attacking cards or transfer the attack. Whoever is left holding cards is the Durak.",
  "Lege eine höhere Karte derselben Farbe oder einen Trumpf. Einen Trumpf schlägst du nur mit einem höheren Trumpf.":
    "Play a higher card of the same suit or a trump. A trump can only be beaten by a higher trump.",
  "Liegt ein Angriffswert auch in deiner Hand, kannst du den gesamten Angriff an den nächsten Spieler schieben.":
    "If you hold a card matching the attacking rank, you can transfer the entire attack to the next player.",
  "Lege gleich viele höhere Karten desselben Werts. Wer zuerst keine Karten mehr hat, gewinnt.":
    "Play the same number of higher cards of one rank. The first player to empty their hand wins.",
  "Zweien sind die höchsten Karten, Dreien die niedrigsten.": "Twos are high; threes are low.",
  "Spiele die beste Fünf-Karten-Kombination aus deinen zwei Handkarten und den fünf Gemeinschaftskarten.":
    "Make the best five-card hand from your two hole cards and the five community cards.",
  "Es wird ausschließlich mit Spielchips gespielt.": "This game uses play chips only.",
  "Werde deine Karten los, sobald der Nachziehstapel leer ist.":
    "Get rid of all your cards once the draw pile is empty.",
  "Angreifen: Lege eine Karte. Danach darfst du Werte nachlegen, die bereits auf dem Tisch liegen.":
    "Attack: Play a card. You may then add ranks that are already on the table.",
  "Verteidigen: Lege eine höhere Karte derselben Farbe oder einen Trumpf. Einen Trumpf schlägt nur ein höherer Trumpf.":
    "Defend: Play a higher card of the same suit or a trump. Only a higher trump beats a trump.",
  "Schieben: Hast du denselben Wert wie die offene Angriffskarte, kannst du ihn dazulegen. Der bisherige Angreifer muss anschließend alle offenen Karten decken.":
    "Transfer: If you hold the same rank as the exposed attacking card, you may add it. The previous attacker must then cover all exposed cards.",
  "Du kannst weder decken noch schieben? Nimm die Karten auf.":
    "Can't cover or transfer? Pick up the cards.",
  "Der Stapel": "The pile",
  "Sechs Startkarten. Die offene Karte unter dem Stapel zeigt die Trumpffarbe.":
    "Start with six cards. The face-up card beneath the pile shows the trump suit.",
  "Nach dem Angriff zieht zuerst der Angreifer, dann der Verteidiger auf sechs Karten nach. Die Trumpfkarte kommt zuletzt.":
    "After the attack, the attacker draws back up to six cards first, followed by the defender. The trump card is drawn last.",
  "Gut zu wissen": "Good to know",
  "Es sind höchstens sechs Angriffskarten erlaubt, jedoch nie mehr, als der Verteidiger zu Beginn des Angriffs auf der Hand hatte. Das gilt auch beim Schieben.":
    "At most six attacking cards are allowed, and never more than the defender held at the start of the attack. This also applies when transferring.",
  "Nach „Aufnehmen“ darf noch nachgeworfen werden. Nach erfolgreicher Abwehr wechseln die Rollen; nach dem Aufnehmen bleibt der Angreifer.":
    "After the defender chooses to pick up, more matching ranks may still be added. Roles switch after a successful defence; after picking up, the attacker remains the same.",
  "Sind beide Hände gleichzeitig leer, endet die Runde unentschieden.":
    "If both hands become empty at the same time, the round ends in a draw.",
  "Leere deine Hand vor den anderen. Wer zuletzt übrig bleibt, ist das Arschloch.":
    "Empty your hand before the others. The last player left becomes the President game's loser.",
  "Karten legen": "Playing cards",
  "Wähle eine Karte oder mehrere Karten mit gleichem Wert.": "Choose one card or several cards of the same rank.",
  "Überbiete mit genau derselben Anzahl und einem höheren Wert. Oder passe.":
    "Beat the play with exactly the same number of cards at a higher rank, or pass.",
  "Reihenfolge: 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → B → D → K → A → 2.":
    "Order: 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → A → 2.",
  "Neu eröffnen": "Starting a new trick",
  "Passen alle anderen, wird der Tisch frei. Wer zuletzt gelegt hat, eröffnet. Ist dessen Hand leer, beginnt der nächste Spieler, der noch Karten hat.":
    "Once everyone else has passed, the table clears. The last player to play leads. If their hand is empty, the next player who still has cards begins.",
  "Nach dem Passen darfst du beim nächsten Umlauf wieder mitspielen.":
    "After passing, you may play again on the next trip around the table.",
  "Nächste Runde": "Next round",
  "Alle 52 Karten werden verteilt. Du eröffnest die erste Runde.": "All 52 cards are dealt. You lead the first round.",
  "Danach gibt das Arschloch seine höchste Karte an den Sieger. Der Sieger gibt eine beliebige Karte zurück und beginnt.":
    "In the next round, the last-place player gives their highest card to the winner. The winner returns any card and leads.",
  "Es gibt keine Joker, keine Revolution und keine zusätzliche Sonderwirkung der 2.":
    "There are no jokers, no revolution, and no additional special effect for twos.",
  "7 → Der nächste Spieler zieht zwei Karten. Eine weitere 7 gibt die Strafe weiter und erhöht sie um zwei.":
    "7 → The next player draws two cards. Another 7 passes the penalty on and adds two more.",
  "8 → Der nächste Spieler setzt aus.": "8 → The next player misses a turn.",
  "9 → Du wählst Kreuz, Karo, Herz oder Pik.": "9 → Choose clubs, diamonds, hearts, or spades.",
  "Klopfen & Punkte": "Knocking & points",
  "Vor dem Ablegen deiner vorletzten Karte musst du auf den Tisch klopfen. Tippe dafür auf die Tischfläche oder nutze die Klopfen-Taste.":
    "Before playing your second-to-last card, knock on the table. Tap the table surface or use the knock button.",
  "Vergessen? Deine letzte Karte bleibt gesperrt. Du ziehst zwei Strafkarten; eine offene 7er-Strafe kommt dazu. Danach geht es beim nächsten Spieler weiter.":
    "Forgot? Your last card remains blocked. Draw two penalty cards, plus any active penalty from sevens. Play then passes to the next player.",
  "Jede Restkarte zählt einen Minuspunkt. Gewinnt jemand mit einer 9 als letzter Karte, werden die Minuspunkte aller Mitspieler verdoppelt. Der Punktestand bleibt über mehrere Runden erhalten.":
    "Each remaining card counts as one penalty point. If a player finishes with a 9, every opponent's penalty points are doubled. Scores carry over between rounds.",
  "36 Karten von 6 bis Ass. Die erste offene Karte hat keinen Sondereffekt.":
    "36 cards from 6 through ace. The first face-up card has no special effect.",
  "Nach dem Ziehen einer Strafe endet dein Zug. Der Ablagestapel wird bei Bedarf neu gemischt; die oberste Karte bleibt liegen.":
    "Your turn ends after drawing a penalty. The discard pile is reshuffled when needed, leaving the top card in place.",
  "Du darfst mit einer Sonderkarte gewinnen, wenn du vorher rechtzeitig geklopft hast.":
    "You may finish with an action card if you knocked in time beforehand.",
  "Ist der Stapel leer und kann eine ganze Runde lang niemand eine Karte legen, gewinnt die kleinste Hand.":
    "If the pile is empty and nobody can play a card for a full round, the smallest hand wins.",
  "Gewinne die Chips im Pot: mit der besten Hand oder indem dein Gegner passt.":
    "Win the chips in the pot with the best hand or by making your opponent fold.",
  "Deine Möglichkeiten": "Your options",
  "Checken: ohne Einsatz weiterspielen, wenn noch nichts zu zahlen ist.":
    "Check: continue without betting when there is nothing to call.",
  "Mitgehen: den angezeigten Betrag bezahlen. Passen: diese Hand aufgeben.":
    "Call: pay the displayed amount. Fold: give up this hand.",
  "Erhöhen: Einsatzregler öffnen, Betrag wählen und bestätigen. Mit All-in setzt du alle deine übrigen Chips.":
    "Raise: open the betting control, choose an amount, and confirm. Going all-in bets all your remaining chips.",
  "Die Karten": "The cards",
  "Du bekommst zwei eigene Karten. In die Mitte kommen erst drei Karten (Flop), dann eine (Turn), dann eine (River).":
    "You receive two hole cards. Three community cards are dealt first (the flop), then one (the turn), and one more (the river).",
  "Es zählen die besten fünf Karten aus deinen zwei Handkarten und den fünf Gemeinschaftskarten. Gleich starke Hände teilen den Pot.":
    "The best five cards from your two hole cards and the five community cards count. Equally strong hands split the pot.",
  "Welche Hand gewinnt?": "Which hand wins?",
  "Von stark nach schwach: Straight Flush · Vierling · Full House · Flush · Straße · Drilling · Zwei Paare · Paar · Hohe Karte.":
    "From strongest to weakest: straight flush · four of a kind · full house · flush · straight · three of a kind · two pair · pair · high card.",
  "Bei Gleichstand entscheidet die höchste übrige Karte. Das Ass kann in A–2–3–4–5 niedrig zählen.":
    "Ties are broken by the highest remaining card. An ace may count low in A–2–3–4–5.",
  "Einsätze und Ablauf": "Bets and play",
  "1.000 Spielchips pro Person. Die Blinds liegen bei 10 / 20, der Button wechselt nach jeder Hand. Vor dem Flop handelt der Small Blind zuerst; ab dem Flop beginnt der Big Blind.":
    "Each player starts with 1,000 play chips. Blinds are 10 / 20, and the button moves after every hand. The small blind acts first before the flop; the big blind begins from the flop onwards.",
  "Die Mindesterhöhung entspricht der letzten vollen Erhöhung, beträgt jedoch mindestens 20 Chips. Ein kleineres All-in gibt Spielern, die bereits gehandelt haben, kein neues Recht auf eine weitere Erhöhung. Nicht mitgegangene Chips erhältst du zurück.":
    "The minimum raise equals the previous full raise and is at least 20 chips. A smaller all-in does not reopen raising for players who have already acted. Uncalled chips are returned.",
  "Es wird ausschließlich mit Spielchips gespielt. Die Bots kennen weder deine Hand noch die kommenden Karten.":
    "Only play chips are used. The bots know neither your hand nor the cards still to come.",
  "Ausführliche Regelgrundlage ↗": "Read the full rules ↗",

  // Tea trail
  "Teeweg": "Tea trail",
  "Tea Trail | Eine kleine Teepause mit Fabian Deragisch": "Tea Trail | A short tea break with Fabian Deragisch",
  "15 Sekunden, eine Tasse grüner Tee und ein kleines Gartenatelier. Spiele Tea Trail, das persönliche 3D-Minispiel von Fabian Deragisch.":
    "15 seconds, a cup of green tea, and a small garden studio. Play Tea Trail, Fabian Deragisch's personal 3D mini-game.",
  "Fabian Deragisch, Startseite": "Fabian Deragisch, home page",
  "Eine kleine Pause bei mir": "A short break at my place",
  "Ein kleiner Weg. Eine volle Tasse.": "A short path. A full cup.",
  "Wie viel Tee kommt bei dir an?": "How much tea will reach the table?",
  "Level auswählen": "Choose a level",
  "Tea Trail Spielbereich": "Tea Trail game area",
  "Eine kleine Figur mit Teetablett auf der Startmatte eines begrünten Miniaturateliers. Vor ihr liegen eine Kamera und mehrere Objektive.":
    "A small figure with a tea tray on the starting mat of a green miniature studio. A camera and several lenses lie ahead.",
  "Tea Trail. Pfeiltasten oder WASD bewegen die Figur. Leertaste stabilisiert. Escape pausiert.":
    "Tea Trail. Use the arrow keys or WASD to move the character. Space steadies the tray. Escape pauses.",
  "Sek.": "sec.",
  "Verbleibender Tee": "Tea remaining",
  "Spiel pausieren": "Pause game",
  "Spieleinstellungen öffnen": "Open game settings",
  "Am Plattenspieler": "By the turntable",
  "Drei Wegmarken, ein rollendes Objektiv und eine lose Teedose. Die Schallplatte spart Zeit, kostet aber Balance.":
    "Three waypoints, a rolling lens, and a loose tea tin. The record saves time but makes balancing harder.",
  "Karten im Wind": "Cards in the wind",
  "Erst außen am Objektiv vorbei, dann zwischen wandernden Karten hindurch. Lose Chips lassen sich verschieben.":
    "First around the outside of the lens, then between moving cards. Loose chips can be pushed aside.",
  "Letzter Aufguss": "Final infusion",
  "Der lange Weg über die Stoffbrücke: zwei bewegliche Kartensperren, schwere Teedosen und wenig Platz zum Bremsen.":
    "The long route across the fabric bridge: two moving card barriers, heavy tea tins, and little room to slow down.",
  "Alle drei Wegmarken passieren. Mindestens 80 % Tee am Tisch abstellen.":
    "Pass all three waypoints. Deliver at least 80% of the tea to the table.",
  "Alle drei Wegmarken passieren. Mindestens 85 % Tee am Tisch abstellen.":
    "Pass all three waypoints. Deliver at least 85% of the tea to the table.",
  "Alle drei Wegmarken passieren. Mindestens 90 % Tee am Tisch abstellen.":
    "Pass all three waypoints. Deliver at least 90% of the tea to the table.",
  "oder": "or",
  "Bewegen mit dem Joystick": "Move with the joystick",
  "Goldene Kreise der Reihe nach passieren. Bei den drei Pfeilen anhalten.":
    "Pass through the golden circles in order. Stop at the three arrows.",
  "Spiel starten": "Start game",
  "Spiel nach deinem Gefühl einstellen": "Adjust how the game feels",
  "Mit Handyneigung spielen? Vorher aktivieren.": "Want to play using device tilt? Enable it first.",
  "Tea Trail braucht JavaScript. Du kannst weiterhin": "Tea Trail requires JavaScript. You can still",
  "meine Website besuchen": "visit my website",
  "Ankommen": "Arrival",
  "Virtueller Joystick, ziehen zum Bewegen": "Virtual joystick; drag to move",
  "Gedrückt halten für ruhigeres Tragen": "Hold to carry more steadily",
  "Ruhig": "Steady",
  "Deine erste Tasse wartet.": "Your first cup is waiting.",
  "Ton stummschalten": "Mute sound",
  "Ton einschalten": "Turn sound on",
  "Lautstärke": "Volume",
  "Leertaste: vor Kurven bremsen": "Space: slow down before bends",
  "Esc: Pause": "Esc: pause",
  "Deine letzten Versuche": "Your recent attempts",
  "Die letzten acht Runden – nur in diesem Tab. Kein Konto, keine Cookies.":
    "Your last eight rounds—only in this tab. No account, no cookies.",
  "Drei Wege zum guten Tee": "Three routes to good tea",
  "Fotografie, Vinyl, Training, Karten und Tee werden zu drei zunehmend kniffligen Parcours. Passiere die goldenen Wegmarken in ihrer Reihenfolge. Am Ziel zeigen drei Pfeile auf den Abstellplatz direkt vor dem Teetisch.":
    "Photography, vinyl, training, cards, and tea form three increasingly tricky courses. Pass the golden waypoints in order. At the finish, three arrows point to the drop-off spot in front of the tea table.",
  "Jedes Level verlangt eine bestimmte Teemenge am Ziel. Wenn du es schaffst, öffnet sich das nächste. Zeit, Kollisionen und ruhige Bewegung bestimmen deine Punkte. Bestleistungen und Versuche bleiben nur für diese Browser-Sitzung erhalten.":
    "Each level requires a certain amount of tea at the finish. Complete it to unlock the next one. Time, collisions, and smooth movement determine your score. Personal bests and attempts remain only for this browser session.",
  "Der Tee kann warten.": "The tea can wait.",
  "Die Zeit steht still. Atme kurz durch.": "Time is paused. Take a breath.",
  "Weiterspielen": "Resume",
  "Dein Spielgefühl.": "Make it feel right.",
  "Einstellungen schließen": "Close settings",
  "Sanfter Modus": "Gentle mode",
  "Mehr Stabilität, etwas weniger Tempo und 20 zusätzliche Sekunden je Level.":
    "More stability, a little less speed, and 20 extra seconds per level.",
  "Gilt ab der nächsten Runde.": "Applies from the next round.",
  "Handyneigung": "Device tilt",
  "Optional: Halte dein Handy ruhig. Deutliches Kippen oder Rütteln bringt das Tablett ins Schwanken und kann Tee verschütten. Der Joystick bewegt die Figur weiterhin.":
    "Optional: Hold your phone steady. Pronounced tilting or shaking makes the tray wobble and may spill tea. The joystick still moves the character.",
  "Neigung aktivieren": "Enable tilt",
  "Neigung deaktivieren": "Disable tilt",
  "Aktuelle Haltung als Mitte setzen": "Set the current position as centre",
  "Die Neigung ist aus. Die Ruhig-Taste hilft auch ohne Sensoren.":
    "Tilt is off. The steady button also works without sensors.",
  "Sensorstärke": "Sensor sensitivity",
  "Mit Leertaste oder der Ruhig-Taste auf dem Handy trägst du langsamer und stabiler.":
    "Use the space bar or the steady button on your phone to carry the tray more slowly and steadily.",
  "Passt für mich": "That feels right",
  "Bewertung": "Rating",
  "Der Tee ist da.": "The tea has arrived.",
  "Tee übrig": "Tea remaining",
  "Zeit": "Time",
  "Punkte": "Points",
  "Parcourskarte mit markierten Stellen, an denen Tee verschüttet wurde":
    "Course map marking the places where tea was spilled",
  "Wo Tee verloren ging": "Where tea was lost",
  "Nächstes Level": "Next level",
  "Level wählen": "Choose level",
  "Letzte Versuche vergleichen": "Compare recent attempts",
  "Eine kurze Unterbrechung.": "A brief interruption.",
  "Atelier erneut laden": "Reload studio",
  "Noch keine Versuche. Deine nächsten acht Runden erscheinen hier.":
    "No attempts yet. Your next eight rounds will appear here.",
  "Letzte Versuche, neuester zuerst": "Recent attempts, newest first",
  "Sanft": "Gentle",
  "Geschafft": "Completed",
  "Vorheriges Level erfolgreich abschließen": "Complete the previous level first",
  "Bestleistung": "Personal best",
  "Pausiert. Die Zeit steht still.": "Paused. Time is standing still.",
  "Weiter geht’s. Bring den Tee zum Tisch.": "Off you go. Bring the tea to the table.",
  "Zeit für einen guten Tee.": "Time for a good cup of tea.",
  "Ein bisschen mehr Tee, bitte.": "A little more tea, please.",
  "Der Tisch wartet noch.": "The table is still waiting.",
  "Ruhige Hände, eine volle Tasse.": "Steady hands, a full cup.",
  "Gut angekommen. Jeder ruhigere Schritt zählt.": "Delivered safely. Every steady step counts.",
  "Angekommen! Mit sanfteren Kurven bleibt beim nächsten Mal mehr Tee.":
    "Delivered! Take gentler turns next time to keep more tea in the cup.",
  "Im sanften Modus.": "In gentle mode.",
  "Deine neue Bestleistung in dieser Sitzung.": "Your new personal best for this session.",
  "Neue Bestleistung für diese Sitzung. Browserspeicherung ist hier nicht verfügbar.":
    "New personal best for this session. Browser storage is not available here.",
  "Drei Level. Ein guter Tee.": "Three levels. One good cup of tea.",
  "Kein Tropfen verloren. So schmeckt eine ruhige Runde.": "Not a drop lost. That is what a calm round tastes like.",
  "Atelier wird vorbereitet …": "Preparing the studio …",
  "Modelle und Physik laden. Nur beim ersten Start.": "Loading models and physics. This only happens on the first start.",
  "Am Tisch angekommen. Die Figur stellt den Tee ab.": "At the table. The character is setting down the tea.",
  "Die Runde beginnt. Folge dem Weg zum Teetisch.": "The round begins. Follow the path to the tea table.",
  "Erneut versuchen": "Try again",
  "Das Atelier konnte nicht starten. Bitte prüfe die Verbindung und ob WebGL 2 im Browser verfügbar ist.":
    "The studio could not start. Please check your connection and whether WebGL 2 is available in your browser.",
  "Neigung ist aus. Joystick und Ruhig-Taste funktionieren weiterhin.":
    "Tilt is off. The joystick and steady button still work.",
  "Training & Karten": "Training & cards",
  "Teezeit": "Tea time",
  "Beschleunigen & Bremsen": "Acceleration & braking",
  "Enge Kurven": "Tight bends",
  "Kollisionen": "Collisions",
  "Ein ruhiger Weg zur nächsten Tasse.": "A calm path to the next cup.",
  "Zum Teetisch": "To the tea table",
  "Teetisch": "Tea table",
  "Route": "Route",
  "Zurücksetzen": "Reset",
  "Tee auswählen": "Choose tea",
  "Wasser erhitzen": "Heat the water",
  "Ziehzeit": "Steeping time",
  "Fertig": "Done",
  "Bereit": "Ready",
  "Tasse": "Cup",
  "Kanne": "Teapot",
  "Blätter": "Leaves",
  "Temperatur": "Temperature",
  "Ziehzeit starten": "Start steeping",
  "Noch einmal": "Again",
  "Tee genießen": "Enjoy your tea",

  // Error and legal pages
  "Seite nicht gefunden | Fabian Deragisch": "Page not found | Fabian Deragisch",
  "Seite nicht gefunden": "Page not found",
  "Diese Seite gibt es leider nicht oder nicht mehr.": "This page does not exist, or no longer exists.",
  "Fehler 404": "Error 404",
  "Hier ist gerade nichts.": "There is nothing here right now.",
  "Vielleicht liegt die gesuchte Seite noch im Skizzenbuch.": "Perhaps the page you are looking for is still in the sketchbook.",
  "Zur Startseite": "Back to home",
  "Impressum | Fabian Deragisch": "Legal notice | Fabian Deragisch",
  "Impressum und Offenlegung der persönlichen Website von Fabian Deragisch.":
    "Legal notice and disclosure for Fabian Deragisch's personal website.",
  "Impressum und Offenlegung": "Legal notice and disclosure",
  "← Zurück zur Website": "← Back to website",
  "Medieninhaber und verantwortlich": "Website owner and person responsible",
  "Standort": "Location",
  "Wien, Österreich": "Vienna, Austria",
  "Fabian Deragisch, Wien, Österreich": "Fabian Deragisch, Vienna, Austria",
  "Zweck der Website": "Purpose of the website",
  "Diese Website ist ein persönliches, nicht-kommerzielles Portfolio. Sie gibt Einblick in meine berufliche Laufbahn, mein Studium, meine Bachelorarbeit und ausgewählte persönliche Interessen. Es werden keine entgeltlichen Leistungen angeboten und keine werblichen Interessen verfolgt.":
    "This website is a personal, non-commercial portfolio. It offers insight into my professional experience, my studies, my bachelor's thesis, and selected personal interests. No paid services are offered and no advertising interests are pursued.",
  "Offenlegung gemäß § 25 MedienG": "Disclosure pursuant to Section 25 of the Austrian Media Act",
  "Medieninhaber: Fabian Deragisch, Wohnort Wien. Inhaltliche Ausrichtung: persönliche Selbstdarstellung und Information über meinen beruflichen und akademischen Werdegang.":
    "Media owner: Fabian Deragisch, resident in Vienna. Editorial purpose: personal presentation and information about my professional and academic background.",
  "Datenschutz | Fabian Deragisch": "Privacy | Fabian Deragisch",
  "Datenschutzhinweise der persönlichen Website von Fabian Deragisch.":
    "Privacy information for Fabian Deragisch's personal website.",
  "Stand: September 2026": "Last updated: September 2026",
  "Verantwortlich": "Controller",
  "Was diese Website nicht macht": "What this website does not do",
  "Diese Website verfolgt keine kommerziellen oder werblichen Interessen. Sie setzt selbst keine Cookies und verwendet keine Analysewerkzeuge, Werbe-Tracker, Kontaktformulare, Benutzerkonten oder eingebetteten Social-Media-Inhalte. Schriften und Symbole werden lokal ausgeliefert.":
    "This website has no commercial or advertising purpose. It does not set its own cookies and does not use analytics, advertising trackers, contact forms, user accounts, or embedded social media content. Fonts and icons are served locally.",
  "Hosting über GitHub Pages": "Hosting via GitHub Pages",
  "Die Website wird über GitHub Pages bereitgestellt, einen Dienst von GitHub, Inc. Beim Aufruf einer GitHub-Pages-Seite wird die IP-Adresse der besuchenden Person laut GitHub zu Sicherheitszwecken protokolliert und gespeichert. Weitere technische Verbindungsdaten können im Rahmen der Bereitstellung verarbeitet werden.":
    "The website is hosted through GitHub Pages, a service provided by GitHub, Inc. According to GitHub, a visitor's IP address is logged and stored for security purposes when a GitHub Pages site is accessed. Further technical connection data may be processed as part of providing the service.",
  "Die Bereitstellung der Website und ihre Absicherung beruhen, soweit mir diese Verarbeitung zuzurechnen ist, auf meinem berechtigten Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO. Weitere Informationen enthält die":
    "Where this processing is attributable to me, providing and securing the website is based on my legitimate interest under Article 6(1)(f) GDPR. Further information is available in the",
  "Datenschutzerklärung von GitHub": "GitHub Privacy Statement",
  "Das freiwillig gestartete Minispiel läuft vollständig in deinem Browser. Bestleistungen, die letzten acht Versuche, freigespielte Level und Spieleinstellungen werden nur für die aktuelle Browser-Sitzung im Tab gespeichert (Session Storage). Die Daten gehören zur jeweiligen Tab-Sitzung; bei der Wiederherstellung einer Browsersitzung kann der Browser sie wiederherstellen. Das Spiel setzt keine Cookies. Es gibt keine Übertragung von Spielständen und keine globale Rangliste. Bei gesperrter Speicherung funktioniert das Spiel weiterhin.":
    "The optional mini-game runs entirely in your browser. Personal bests, the last eight attempts, unlocked levels, and game settings are stored only for the current browser session in that tab (session storage). The data belongs to the individual tab session; the browser may restore it when restoring a session. The game sets no cookies. Scores are not transmitted and there is no global leaderboard. The game continues to work if storage is blocked.",
  "Die optionale Handyneigung wird erst nach deiner bewussten Aktivierung abgefragt. Neigungs- und Beschleunigungswerte werden nur während der Nutzung im Arbeitsspeicher verarbeitet, weder gespeichert noch übertragen. Die Neigung lässt sich in den Spieleinstellungen jederzeit deaktivieren. Ton beginnt erst nach dem Start des Spiels.":
    "Optional device tilt is requested only after you actively enable it. Tilt and acceleration values are processed in memory only while the feature is in use; they are neither stored nor transmitted. Tilt can be disabled at any time in the game settings. Sound begins only after the game starts.",
  "Kontakt per E-Mail": "Contact by email",
  "Wenn du mir eine E-Mail sendest, verarbeite ich die von dir freiwillig übermittelten Angaben, um deine Nachricht zu beantworten. Rechtsgrundlage ist je nach Inhalt Art. 6 Abs. 1 lit. b oder lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die Kommunikation nicht mehr benötigt werden und keine gesetzlichen Aufbewahrungspflichten bestehen.":
    "If you send me an email, I process the information you voluntarily provide in order to respond to your message. Depending on its content, the legal basis is Article 6(1)(b) or (f) GDPR. The data is deleted once it is no longer needed for communication and no statutory retention obligations apply.",
  "Externe Links": "External links",
  "Die Website verlinkt auf LinkedIn und Instagram, bindet von diesen Plattformen aber keine Inhalte ein. Erst wenn du einen solchen Link aufrufst, gelten die Datenschutzbestimmungen des jeweiligen Anbieters.":
    "The website links to LinkedIn and Instagram but does not embed content from these platforms. The respective provider's privacy terms apply only after you open one of those links.",
  "Deine Rechte": "Your rights",
  "Du kannst im Rahmen der gesetzlichen Voraussetzungen Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Widerspruch verlangen. Außerdem besteht ein Beschwerderecht bei der":
    "Subject to the applicable legal requirements, you may request access, rectification, erasure, restriction of processing, or object to processing. You also have the right to lodge a complaint with the",
  "Österreichischen Datenschutzbehörde": "Austrian Data Protection Authority",
  "Angaben gemäß § 5 TMG": "Information pursuant to Section 5 TMG",
  "Verantwortlich für den Inhalt": "Responsible for content",
  "Haftung für Inhalte": "Liability for content",
  "Haftung für Links": "Liability for links",
  "Urheberrecht": "Copyright",
  "Datenschutzerklärung": "Privacy policy",
  "Allgemeine Hinweise": "General information",
  "Verantwortliche Stelle": "Controller",
  "Erhebung und Speicherung personenbezogener Daten": "Collection and storage of personal data",
  "Kontaktaufnahme": "Contacting me",
  "Ihre Rechte": "Your rights",

  // Thesis reader
  "Bachelorarbeit | Fabian Deragisch": "Bachelor's thesis | Fabian Deragisch",
  "Leseansicht der Bachelorarbeit Kreative Synergien von Fabian Deragisch.":
    "Reader view of Fabian Deragisch's bachelor's thesis Creative Synergies.",
  "Bachelorarbeit · Universität Passau · 2024": "Bachelor's thesis · University of Passau · 2024",
  "Kreative Synergien": "Creative Synergies",
  "Bachelorarbeit Kreative Synergien": "Bachelor's thesis Creative Synergies",
  "Die eingebettete Ansicht wird hier nicht unterstützt.": "The embedded view is not supported here.",
  "Du kannst die Bachelorarbeit stattdessen direkt im Browser öffnen.":
    "You can open the bachelor's thesis directly in your browser instead.",
  "PDF öffnen": "Open PDF",
};

const patterns: Array<[RegExp, (...matches: string[]) => string]> = [
  [/^(Open|Close) status: Gerade wahrscheinlich (.+)$/, (action, detail) => `${action} status: Probably ${translateString(detail)}`],
  [/^Status öffnen: Gerade wahrscheinlich (.+)$/, (detail) => `Open status: Probably ${translateString(detail)}`],
  [/^Status schließen: Gerade wahrscheinlich (.+)$/, (detail) => `Close status: Probably ${translateString(detail)}`],
  [/^Gerade wahrscheinlich (.+)$/, (detail) => `Probably ${translateString(detail)}`],
  [/^Gerade (.+)$/, (detail) => `Currently ${translateString(detail)}`],
  [/^(\d+)\. Januar (\d{4})$/, (day, year) => `${day} January ${year}`],
  [/^(\d+)\. Februar (\d{4})$/, (day, year) => `${day} February ${year}`],
  [/^(\d+)\. März (\d{4})$/, (day, year) => `${day} March ${year}`],
  [/^(\d+)\. April (\d{4})$/, (day, year) => `${day} April ${year}`],
  [/^(\d+)\. Mai (\d{4})$/, (day, year) => `${day} May ${year}`],
  [/^(\d+)\. Juni (\d{4})$/, (day, year) => `${day} June ${year}`],
  [/^(\d+)\. Juli (\d{4})$/, (day, year) => `${day} July ${year}`],
  [/^(\d+)\. August (\d{4})$/, (day, year) => `${day} August ${year}`],
  [/^(\d+)\. September (\d{4})$/, (day, year) => `${day} September ${year}`],
  [/^(\d+)\. Oktober (\d{4})$/, (day, year) => `${day} October ${year}`],
  [/^(\d+)\. November (\d{4})$/, (day, year) => `${day} November ${year}`],
  [/^(\d+)\. Dezember (\d{4})$/, (day, year) => `${day} December ${year}`],
  [/^(\d+) Karte$/, (count) => `${count} card`],
  [/^(\d+) Karten$/, (count) => `${count} cards`],
  [/^(\d+) verdeckte Karte$/, (count) => `${count} face-down card`],
  [/^(\d+) verdeckte Karten$/, (count) => `${count} face-down cards`],
  [/^(\d+) im Stapel$/, (count) => `${count} in the pile`],
  [/^(\d+) Karten im Stapel$/, (count) => `${count} cards in the pile`],
  [/^Nachziehstapel: (\d+) Karten$/, (count) => `Draw pile: ${count} cards`],
  [/^Trumpf: (.+)$/, (suit) => `Trump: ${translateString(suit)}`],
  [/^([BDKA]|\d+) (Kreuz|Karo|Herz|Pik)$/, (rank, suit) => `${translateString(rank)} of ${translateString(suit).toLowerCase()}`],
  [/^Stapel: (\d+)$/, (count) => `Pile: ${count}`],
  [/^Pot (\d+)$/, (amount) => `Pot ${amount}`],
  [/^Du: (\d+) Chips$/, (amount) => `You: ${amount} chips`],
  [/^(\d+) Chips$/, (amount) => `${amount} chips`],
  [/^(.+) überlegt …$/, (name) => `${name} is thinking …`],
  [/^(.+) ist am Zug\.$/, (name) => `${translateString(name)}'s turn.`],
  [/^(.+) hat gewonnen\.$/, (name) => `${translateString(name)} won.`],
  [/^(.+) gewinnt\.$/, (name) => `${translateString(name)} wins.`],
  [/^(.+) ist ausgestiegen\.$/, (name) => `${translateString(name)} folded.`],
  [/^(.+) passt\.$/, (name) => `${translateString(name)} passes.`],
  [/^(.+) zieht (\d+) Karten\.$/, (name, count) => `${translateString(name)} draws ${count} cards.`],
  [/^(.+) zieht eine Karte\.$/, (name) => `${translateString(name)} draws a card.`],
  [/^(.+) legt (.+) und wählt (.+)\.$/, (name, card, suit) => `${translateString(name)} plays ${translateString(card)} and chooses ${translateString(suit)}.`],
  [/^(.+) legt (.+)\.$/, (name, card) => `${translateString(name)} plays ${translateString(card)}.`],
  [/^(.+) deckt mit (.+)\.$/, (name, card) => `${translateString(name)} covers with ${translateString(card)}.`],
  [/^(.+) greift mit (.+) an\.$/, (name, card) => `${translateString(name)} attacks with ${translateString(card)}.`],
  [/^(.+) greift an\. (.+) ist Trumpf\.$/, (name, suit) => `${translateString(name)} attacks. ${translateString(suit)} are trumps.`],
  [/^(.+) schiebt den Angriff mit (.+) weiter\.$/, (name, card) => `${translateString(name)} transfers the attack with ${translateString(card)}.`],
  [/^(.+) nimmt auf\. Passende Werte dürfen noch nachgeworfen werden\.$/, (name) => `${translateString(name)} picks up. Matching ranks may still be added.`],
  [/^(.+) beginnt den nächsten Angriff\.$/, (name) => `${translateString(name)} begins the next attack.`],
  [/^(.+) erhält die höchste Karte und gibt eine Karte zurück\.$/, (name) => `${translateString(name)} receives the highest card and gives one back.`],
  [/^(.+) eröffnet die neue Runde\.$/, (name) => `${translateString(name)} leads the new round.`],
  [/^(.+) spielt (.+)\.$/, (name, cards) => `${translateString(name)} plays ${cards.split(', ').map(translateString).join(', ')}.`],
  [/^(.+) hat das Ausspiel\.$/, (name) => `${translateString(name)} leads.`],
  [/^(.+) klopft auf den Tisch\.$/, (name) => `${translateString(name)} knocks on the table.`],
  [/^(.+) hat das Klopfen vergessen und zieht (\d+) Strafkarten\.$/, (name, count) => `${translateString(name)} forgot to knock and draws ${count} penalty cards.`],
  [/^(.+) gewinnt den Pot\.$/, (name) => `${translateString(name)} wins the pot.`],
  [/^(.+) gewinnt mit (.+)\.$/, (name, hand) => `${translateString(name)} wins with ${translateString(hand)}.`],
  [/^(.+) gewinnt\. (.+) ist das Arschloch\.$/, (winner, last) => `${translateString(winner)} wins. ${translateString(last)} finishes last.`],
  [/^(.+) passt\. (.+) gewinnt den Pot\.$/, (folded, winner) => `${translateString(folded)} folds. ${translateString(winner)} wins the pot.`],
  [/^(.+) erhöht auf (\d+)\.$/, (name, amount) => `${translateString(name)} raises to ${amount}.`],
  [/^(.+) geht mit (\d+) mit\.$/, (name, amount) => `${translateString(name)} calls ${amount}.`],
  [/^(.+) checkt\.$/, (name) => `${translateString(name)} checks.`],
  [/^(.+) geht All-in\.$/, (name) => `${translateString(name)} goes all-in.`],
  [/^(.+) geht all-in\.$/, (name) => `${translateString(name)} goes all-in.`],
  [/^(Preflop|Flop|Turn|River)\. (.+) beginnt\.$/, (street, name) => `${street}. ${translateString(name)} acts first.`],
  [/^Pot (\d+) · Blinds (\d+) \/ (\d+) · Button: (.+) · Nur Spielchips$/, (pot, small, big, button) => `Pot ${pot} · blinds ${small} / ${big} · button: ${translateString(button)} · play chips only`],
  [/^(Showdown|Ohne Showdown) · Pot (\d+)$/, (kind, pot) => `${translateString(kind)} · pot ${pot}`],
  [/^Trumpf (.+)$/, (suit) => `Trump: ${translateString(suit)}`],
  [/^(.+) ist Trumpf\.$/, (suit) => `${translateString(suit)} are trumps.`],
  [/^Aktive Farbe: (.+), (\d+) Strafkarten$/, (suit, count) => `Active suit: ${translateString(suit)}, ${count} penalty cards`],
  [/^Aktive Farbe: (.+)$/, (suit) => `Active suit: ${translateString(suit)}`],
  [/^Ziehe (\d+) Karten$/, (count) => `Draw ${count} cards`],
  [/^7 legen oder (\d+) ziehen$/, (count) => `Play a 7 or draw ${count}`],
  [/^Klopfen vergessen · (\d+) ziehen$/, (count) => `Missed knock · draw ${count}`],
  [/^(\d+) höhere Karten legen$/, (count) => `Play ${count} higher cards`],
  [/^Erhöhen · (\d+)$/, (amount) => `Raise · ${amount}`],
  [/^Mitgehen · (\d+)$/, (amount) => `Call · ${amount}`],
  [/^All-in · (\d+)$/, (amount) => `All-in · ${amount}`],
  [/^Setzen (\d+)$/, (amount) => `Bet ${amount}`],
  [/^Erhöhen auf (\d+)$/, (amount) => `Raise to ${amount}`],
  [/^(\d+) Chips gesamt$/, (amount) => `${amount} chips total`],
  [/^Setzen · (\d+)$/, (amount) => `Bet · ${amount}`],
  [/^Angriff (\d+)$/, (number) => `Attack ${number}`],
  [/^(.+) · zu überbieten$/, (name) => `${name} · beat this`],
  [/^(.+): −(\d+) · Gesamt −(\d+)$/, (name, round, total) => `${name}: −${round} · total −${total}`],
  [/^(\d+) niedrig · (\d+) hoch · (.+)$/, (low, high, detail) => `${low} low · ${high} high · ${translateString(detail)}`],
  [/^(\d+) Karten überbieten$/, (count) => `beat ${count} cards`],
  [/^(\d+) Karte überbieten$/, (count) => `beat ${count} card`],
  [/^Kartentausch · höchste Karte gegen freie Wahl$/, () => `Card exchange · highest card for a card of the winner's choice`],
  [/^Details zu (.+) anzeigen$/, (label) => `Show details for ${translateString(label)}`],
  [/^Vorderseite von (.+) anzeigen$/, (label) => `Show front of ${translateString(label)}`],
  [/^(.+) von (.+) auf Spotify hören$/, (album, artist) => `Listen to ${album} by ${artist} on Spotify`],
  [/^Alle (\d+) Fotos in der Fotogalerie ansehen$/, (count) => `View all ${count} photos in the gallery`],
  [/^Cover von (.+) von (.+)$/, (album, artist) => `Cover of ${album} by ${artist}`],
  [/^(.+) spielen \(neuer Tab\)$/, (game) => `Play ${translateString(game)} (new tab)`],
  [/^(.+) öffnen: (.+)$/, (label, detail) => `Open ${translateString(label).toLowerCase()}: ${translateString(detail)}`],
  [/^(.+) schließen: (.+)$/, (label, detail) => `Close ${translateString(label).toLowerCase()}: ${translateString(detail)}`],
  [/^Uff, (\d+) Karten für mich\.$/, (count) => `Oof, ${count} cards for me.`],
  [/^Ich mach (\d+)\.$/, (amount) => `I'll make it ${amount}.`],
  [/^Rauf auf (\d+)\.$/, (amount) => `Up to ${amount}.`],
  [/^(\d+)\. Gehst du mit\?$/, (amount) => `${amount}. Are you in?`],
  [/^Jetzt sind es (\d+)\.$/, (amount) => `Now it's ${amount}.`],
  [/^Ich wünsche (.+)\.$/, (suit) => `I choose ${translateString(suit).toLowerCase()}.`],
  [/^(.+), bitte\.$/, (suit) => `${translateString(suit)}, please.`],
  [/^Ab jetzt (.+)\.$/, (suit) => `${translateString(suit)} from now on.`],
  [/^(\d+) Sekunden$/, (seconds) => `${seconds} seconds`],
  [/^Level (\d+) · (.+)$/, (level, name) => `Level ${level} · ${translateString(name)}`],
  [/^Bestleistung( · Sanft)?: (\d+) Punkte · (\d+) % Tee$/, (gentle, score, tea) => `Personal best${gentle ? ' · gentle' : ''}: ${score} points · ${tea}% tea`],
  [/^(\d+) von 3 Teeblättern$/, (leaves) => `${leaves} of 3 tea leaves`],
  [/^(\d+) (Kollision|Kollisionen) · (\d+) % ruhige Bewegung$/, (count, _label, smooth) => `${count} ${count === '1' ? 'collision' : 'collisions'} · ${smooth}% smooth movement`],
  [/^Am Tisch angekommen, aber dieses Level braucht mindestens (\d+) % Tee\. Bremse vor den Kurven kurz ab\.$/, (tea) => `You reached the table, but this level requires at least ${tea}% tea. Slow down briefly before bends.`],
  [/^(\d+) Sekunden sind um\. (\d+) % Tee sind noch in deiner Tasse\. Merke dir die Wegmarken\. Vor engen Kurven kurz ruhiger tragen\.$/, (seconds, tea) => `${seconds} seconds are up. ${tea}% of the tea remains. Remember the waypoints and carry more steadily before tight bends.`],
  [/^Am meisten verloren: (.+) \((.+) %\)\. Die Punkte auf der Karte zeigen die Stellen\.$/, (section, amount) => `Most tea lost: ${translateString(section)} (${amount}%). The dots on the map show where.`],
  [/^Runde beendet\. (Ziel erreicht\.)? ?(\d+) Prozent Tee, (\d+) Punkte, (\d+) Teeblätter\.$/, (goal, tea, score, leaves) => `Round over. ${goal ? 'Goal reached. ' : ''}${tea}% tea, ${score} points, ${leaves} tea leaves.`],
  [/^(\d+) % zum Teetisch$/, (progress) => `${progress}% to the tea table`],
];

function translateString(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return value;

  const direct = translations[normalized];
  if (direct) return direct;

  for (const [pattern, replacement] of patterns) {
    const match = normalized.match(pattern);
    if (match) return replacement(...match.slice(1));
  }

  return normalized;
}

function withWhitespace(original: string, translated: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

function isTranslatable(node: Node): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  return !parent.closest("script, style, noscript, [data-no-translate]");
}

function translateTextNode(node: Text): void {
  if (!isTranslatable(node)) return;
  const source = node.data;
  const translated = translateString(source);
  if (translated !== source.trim().replace(/\s+/g, " ")) {
    node.data = withWhitespace(source, translated);
  }
}

const translatedAttributes = ["aria-label", "title", "placeholder", "alt"] as const;

function translateElement(element: Element): void {
  if (element.closest("[data-no-translate]")) return;
  translatedAttributes.forEach((attribute) => {
    const source = element.getAttribute(attribute);
    if (!source) return;
    const translated = translateString(source);
    if (translated !== source.trim().replace(/\s+/g, " ")) {
      element.setAttribute(attribute, translated);
    }
  });
}

function translateTree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) translateElement(root as Element);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) translateTextNode(current as Text);
    else translateElement(current as Element);
    current = walker.nextNode();
  }
}

function updateSwitches(locale: Locale): void {
  document.querySelectorAll<HTMLButtonElement>("[data-language-switch]").forEach((button) => {
    button.setAttribute("aria-label", locale === "de" ? "Switch to English" : "Auf Deutsch wechseln");
    button.setAttribute("title", locale === "de" ? "English" : "Deutsch");
    button.dataset.locale = locale;
  });
}

function setupSwitches(locale: Locale): void {
  updateSwitches(locale);
  document.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-language-switch]");
    if (!button) return;

    const next: Locale = locale === "de" ? "en" : "de";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The URL still keeps the explicit choice if storage is unavailable.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  });
}

const locale: Locale = document.documentElement.lang === "en" ? "en" : "de";
setupSwitches(locale);

if (locale === "en") {
  document.title = translateString(document.title);
  document.querySelectorAll<HTMLMetaElement>('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').forEach((meta) => {
    meta.content = translateString(meta.content);
  });
  document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')?.setAttribute("content", "en_GB");
  translateTree(document.body);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target as Text);
        return;
      }
      if (mutation.type === "attributes") {
        translateElement(mutation.target as Element);
        return;
      }
      mutation.addedNodes.forEach(translateTree);
    });
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...translatedAttributes],
  });
}

document.documentElement.dataset.i18nReady = "true";
window.dispatchEvent(new CustomEvent("site-language-ready", { detail: { locale } }));

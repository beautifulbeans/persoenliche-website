export type TimelineEntry = {
  period: string;
  title: string;
  organization?: string;
  description: string;
  details?: string[];
  context?: string;
  backTitle?: string;
  backIntro?: string;
  backDetails?: {
    icon: string;
    title: string;
    text: string;
  }[];
  current?: boolean;
  icon: string;
};

export const profile = {
  name: "Fabian Deragisch",
  role: "Mitarbeiter im Marketing und E-Commerce",
  statement:
    "Portfolio, Lebenslauf und ein kleiner Einblick in die Person dahinter.",
  focus:
    "Von SEO und Website-Content bis zu E-Mail-Marketing und CMS-Pflege.",
  thesis: {
    title:
      "Kreative Synergien: Die Zukunft der Zusammenarbeit von KI und Künstlern",
    summary:
      "Die Bachelorarbeit beschäftigt sich mit der Frage, wie KI und künstlerische Praxis zusammenwirken können und welche Zukunftsbilder daraus für kreative Zusammenarbeit entstehen.",
    documentUrl:
      "./bachelorarbeit-fabian-deragisch/Kreative%20Synergien_Bachelorarbeit_Fabian%20Deragisch.pdf",
    readerUrl: "./bachelorarbeit/",
    takeaways: [
      {
        icon: "ph-magnifying-glass",
        title: "Herangehensweise",
        text: "Literatur zu Kreativität, KI, Urheberrecht und drei konkreten Tools trifft auf fünf leitfadengestützte Experteninterviews und eine qualitative Inhaltsanalyse mit MAXQDA.",
      },
      {
        icon: "ph-intersect-three",
        title: "Ko-Kreativität statt Ersatz",
        text: "Das stärkste Zukunftsmodell ist die Zusammenarbeit: KI gibt Impulse und erleichtert Schritte, während Menschen Bedeutung, Auswahl und Richtung bestimmen.",
      },
      {
        icon: "ph-sparkle",
        title: "Neue kreative Zugänge",
        text: "Schnelleres Experimentieren, stärker individualisierte Ergebnisse und ein einfacherer Einstieg können neue Formen von Kunst und neues Interesse daran ermöglichen.",
      },
      {
        icon: "ph-scales",
        title: "Die kritische Seite",
        text: "Urheberrecht, Kennzeichnung und Trainingsdaten bleiben ebenso offen wie Missbrauch, Leistungsdruck und die Frage, ob Einzigartigkeit und Emotion verloren gehen.",
      },
    ],
  },
  statusNotes: [
    { icon: "ph-hammer", label: "Gerade", text: "Website wächst" },
    { icon: "ph-vinyl-record", label: "Aufgelegt", text: "Blonde" },
    { icon: "ph-leaf", label: "Heute in der Kanne", text: "Sencha" },
    { icon: "ph-camera", label: "Fotografiert", text: "Licht in Wien" },
  ],
};

export const work: TimelineEntry[] = [
  {
    period: "Aktuell",
    title: "Mitarbeiter im Marketing und E-Commerce",
    description:
      "SEO, Website, E-Mail-Marketing und CRM gehören zu meinem laufenden Tagesgeschäft.",
    details: [
      "E-Mail-Marketing und Mailings",
      "SEO und Website-Content",
      "Content-Pflege in Magnolia CMS",
      "Arbeit mit Canva und Microsoft Dynamics",
    ],
    backTitle: "Was ich konkret mache",
    backIntro:
      "Ich halte Inhalte, Kampagnen und Systeme im Alltag zusammen. Je nach Thema arbeite ich eigenständig oder gemeinsam mit einer Agentur.",
    backDetails: [
      {
        icon: "ph-magnifying-glass",
        title: "SEO",
        text: "Technische und redaktionelle Themen abstimmen, Optimierungen begleiten und die Website aktuell halten.",
      },
      {
        icon: "ph-chart-line-up",
        title: "Analyse",
        text: "KPIs beobachten, Entwicklungen einordnen und Performance-Reportings für die weitere Arbeit aufbereiten.",
      },
      {
        icon: "ph-envelope-simple",
        title: "CRM und Mailings",
        text: "Segmente in Microsoft Dynamics erstellen, Mailings versenden und die benötigten Medien selbst vorbereiten.",
      },
      {
        icon: "ph-paint-brush",
        title: "Content und Gestaltung",
        text: "Content in Magnolia pflegen und mit Canva CI-konforme Grafiken für Website und E-Mail erstellen.",
      },
    ],
    current: true,
    icon: "ph-briefcase",
  },
  {
    period: "März 2022 - Februar 2024",
    title: "Werkstudent externe Kommunikation und Marketing",
    organization: "Landkreis Passau Gesundheitseinrichtungen",
    description:
      "Digitale Kommunikation, redaktionelle Website-Arbeit und Gestaltung für unterschiedliche interne und externe Berührungspunkte.",
    details: [
      "Homepages, Unterseiten und SEO",
      "Social Media, Flyer und Plakate",
      "Stellenanzeigen und Mitarbeiterkommunikation",
      "Mitwirkung an einer Mitarbeiter-Info-App",
    ],
    context: "Parallel zum Bachelorstudium",
    backTitle: "Marketingpraxis im Studium",
    backIntro:
      "Während meines Bachelorstudiums arbeitete ich als Werkstudent in der externen Kommunikation und im Marketing.",
    backDetails: [
      {
        icon: "ph-newspaper",
        title: "Recruiting",
        text: "Stellenanzeigen für Printmedien, Indeed, Ärztestellen und weitere passende Kanäle planen und publizieren.",
      },
      {
        icon: "ph-wallet",
        title: "Budget",
        text: "Geeignete Medien auswählen und bei der Schaltung von Stellenanzeigen mit einem festen Budget arbeiten.",
      },
      {
        icon: "ph-browser",
        title: "Website und SEO",
        text: "Seiten und Unterseiten erstellen, Inhalte pflegen und erste SEO-Aufgaben übernehmen.",
      },
      {
        icon: "ph-device-mobile",
        title: "Mitarbeiter-App",
        text: "An Layout, Inhalten und Funktionen einer internen Mitarbeiter-Info-App mitarbeiten.",
      },
    ],
    icon: "ph-megaphone",
  },
];

export const education: TimelineEntry[] = [
  {
    period: "Oktober 2020 - Mai 2024",
    title: "Bachelor Medien und Kommunikation",
    organization: "Universität Passau",
    description: "Bachelor of Arts, abgeschlossen mit der Gesamtnote 2,3.",
    context: "Parallel im Marketing tätig",
    backTitle: "Was im Studium zusammenkam",
    backIntro:
      "Das Studium verband Kommunikationswissenschaft mit ergänzenden Einblicken in Wirtschaft und Informatik.",
    backDetails: [
      {
        icon: "ph-chats-circle",
        title: "Kommunikation",
        text: "Theorien, Modelle und Forschung zu Medien, Kommunikation und unterschiedlichen Formen öffentlicher Verständigung.",
      },
      {
        icon: "ph-chart-pie-slice",
        title: "Wirtschaft",
        text: "Zusatzmodule vermittelten wirtschaftswissenschaftliche Grundlagen und neue Perspektiven auf Organisationen.",
      },
      {
        icon: "ph-code",
        title: "Informatik",
        text: "Ergänzende Module gaben mir einen Einstieg in grundlegende Konzepte der Informatik und digitaler Systeme.",
      },
      {
        icon: "ph-brain",
        title: "Bachelorarbeit",
        text: "Abschlussarbeit über die Zusammenarbeit von KI und Kunst, mit Blick auf Potenziale und kritische Fragen.",
      },
    ],
    icon: "ph-graduation-cap",
  },
  {
    period: "Oktober 2019 - September 2020",
    title: "Business Administration & Economics",
    organization: "Universität Passau",
    description:
      "Mein erster Studienweg mit dem Ziel, später im Marketing zu arbeiten.",
    backTitle: "Warum ich gewechselt habe",
    backIntro:
      "Der wirtschaftswissenschaftliche Einstieg war fachlich interessant, passte aber nicht dauerhaft zu mir. Medien und Kommunikation traf meine Interessen genauer.",
    backDetails: [
      {
        icon: "ph-buildings",
        title: "Grundlagen",
        text: "Ein Einstieg in Betriebswirtschaft, Volkswirtschaft und wirtschaftliches Denken.",
      },
      {
        icon: "ph-signpost",
        title: "Ziel Marketing",
        text: "Marketing war schon damals die Richtung, in die ich mich beruflich entwickeln wollte.",
      },
      {
        icon: "ph-arrows-left-right",
        title: "Bewusster Wechsel",
        text: "Nach zwei Semestern wechselte ich zu Medien und Kommunikation, ohne das ursprüngliche Berufsziel aus den Augen zu verlieren.",
      },
    ],
    icon: "ph-books",
  },
  {
    period: "Juni 2019",
    title: "Abitur",
    organization: "Adalbert-Stifter-Gymnasium Passau",
    description: "Allgemeine Hochschulreife in Bayern.",
    icon: "ph-certificate",
  },
];

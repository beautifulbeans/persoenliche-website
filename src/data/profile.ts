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
  logoKey?: string;
  logoAlt?: string;
  logoMonogram?: string;
};

export const profile = {
  name: "Fabian Deragisch",
  role: "Mitarbeiter im Marketing und E-Commerce",
  currentOrganization: "DERTOUR Austria GmbH",
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
};

export const work: TimelineEntry[] = [
  {
    period: "August 2024 - heute",
    title: "Mitarbeiter im Marketing und E-Commerce",
    organization: "DERTOUR Austria GmbH",
    description:
      "Zwischen Website, SEO, Newsletter und CRM, mit Blick auf Zahlen und Gestaltung.",
    details: [
      "SEO-Maßnahmen und Website-Content",
      "Monitoring mit Search Console und SISTRIX",
      "KPI- und Performance-Reportings",
      "Newsletter, CM-Mailings und CRM-Segmente",
    ],
    backTitle: "Was ich konkret mache",
    backIntro:
      "Im Alltag wechselt es zwischen Website, Analyse, CRM und Gestaltung. Vieles entsteht im Austausch mit Kolleg:innen, einiges setze ich direkt selbst um.",
    backDetails: [
      {
        icon: "ph-magnifying-glass",
        title: "SEO und Website",
        text: "SEO-Potenziale identifizieren und Maßnahmen umsetzen, vom Content bis zu ausgewählten technischen Themen. Website-Inhalte und Kampagnen pflege ich in Magnolia.",
      },
      {
        icon: "ph-chart-line-up",
        title: "Monitoring und Reporting",
        text: "Mit Google Search Console, SISTRIX und weiteren Tools beobachte ich Entwicklungen, erstelle regelmäßige KPI-Reports und präsentiere die Ergebnisse.",
      },
      {
        icon: "ph-envelope-simple",
        title: "CRM und E-Mail",
        text: "In Microsoft Dynamics baue ich Segmente sowie CM-Mailings und kümmere mich um das Newsletter-Marketing.",
      },
      {
        icon: "ph-paint-brush",
        title: "Gestaltung und Austausch",
        text: "Grafiken und weitere Medien erstelle ich selbst und stimme Kampagnen mit den beteiligten Kolleg:innen ab.",
      },
    ],
    current: true,
    icon: "ph-briefcase",
    logoKey: "dertour-austria",
    logoAlt: "Logo der DERTOUR Austria GmbH",
    logoMonogram: "DT",
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
    logoKey: "landkreis-passau-gesundheit",
    logoAlt: "Logo der Landkreis Passau Gesundheitseinrichtungen",
    logoMonogram: "LGP",
  },
];

export const education: TimelineEntry[] = [
  {
    period: "Oktober 2020 - Mai 2024",
    title: "Medien und Kommunikation (B.A.)",
    organization: "Universität Passau",
    description:
      "Bachelorstudium mit Schwerpunkten in Medien, Kommunikation und digitaler Öffentlichkeit. 2024 mit der Gesamtnote 2,3 abgeschlossen.",
    context: "Bachelor of Arts · Abschluss 2024",
    backTitle: "Was im Studium zusammenkam",
    backIntro:
      "Kommunikationswissenschaft im Mittelpunkt, ergänzt durch Einblicke in Wirtschaft und Informatik.",
    backDetails: [
      {
        icon: "ph-chats-circle",
        title: "Medien und Kommunikation",
        text: "Theorien, Modelle und Forschung zu Medien, Kommunikation und öffentlicher Verständigung.",
      },
      {
        icon: "ph-chart-pie-slice",
        title: "Zusatzmodule",
        text: "Ergänzende Grundlagen aus Wirtschaft und Informatik.",
      },
      {
        icon: "ph-brain",
        title: "Bachelorarbeit",
        text: "Abschlussarbeit über die Zusammenarbeit von KI und Kunst, mit Blick auf Potenziale und kritische Fragen.",
      },
      {
        icon: "ph-books",
        title: "Davor: BAE",
        text: "2019 begann ich mit Business Administration & Economics und wechselte nach zwei Semestern zu Medien und Kommunikation.",
      },
    ],
    icon: "ph-graduation-cap",
    logoKey: "universitaet-passau",
    logoAlt: "Logo der Universität Passau",
    logoMonogram: "UP",
  },
  {
    period: "Juni 2019",
    title: "Abitur",
    organization: "Adalbert-Stifter-Gymnasium Passau",
    description: "Allgemeine Hochschulreife in Bayern.",
    icon: "ph-certificate",
    logoKey: "asg-passau",
    logoAlt: "Logo des Adalbert-Stifter-Gymnasiums Passau",
    logoMonogram: "ASG",
  },
];

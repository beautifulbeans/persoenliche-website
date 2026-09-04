import { profile } from "./profile";

export type JsonLd = Record<string, unknown>;

type SiteSchemaOptions = {
  siteUrl: URL;
  portraitUrl: string;
};

type GalleryImage = {
  url: string;
  title: string;
  description: string;
};

const profilePath = "/#fabian-deragisch";
const pagePath = "/#profil";
const thesisPath = "/bachelorarbeit/#arbeit";

const absoluteUrl = (path: string, siteUrl: URL) => new URL(path, siteUrl).href;

const personReference = (siteUrl: URL) => ({
  "@id": absoluteUrl(profilePath, siteUrl),
});

export const createProfilePageSchema = ({ siteUrl, portraitUrl }: SiteSchemaOptions): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": absoluteUrl(pagePath, siteUrl),
  url: absoluteUrl("/", siteUrl),
  name: "Fabian Deragisch | Marketing, E-Commerce & Teeliebhaber",
  description: profile.statement,
  inLanguage: "de-AT",
  dateModified: "2026-09-04",
  isPartOf: {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website", siteUrl),
    url: absoluteUrl("/", siteUrl),
    name: "Fabian Deragisch",
    alternateName: "fabianderagisch.com",
    inLanguage: "de-AT",
  },
  mainEntity: {
    "@type": "Person",
    "@id": absoluteUrl(profilePath, siteUrl),
    name: profile.name,
    url: absoluteUrl("/", siteUrl),
    mainEntityOfPage: {
      "@id": absoluteUrl(pagePath, siteUrl),
    },
    image: portraitUrl,
    description: `${profile.role} bei ${profile.currentOrganization}. ${profile.statement}`,
    jobTitle: profile.role,
    worksFor: {
      "@type": "Organization",
      name: profile.currentOrganization,
    },
    homeLocation: {
      "@type": "City",
      name: "Wien",
      containedInPlace: {
        "@type": "Country",
        name: "Österreich",
      },
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Universität Passau",
        url: "https://www.uni-passau.de/",
      },
      {
        "@type": "HighSchool",
        name: "Adalbert-Stifter-Gymnasium Passau",
      },
    ],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Bachelor of Arts Medien und Kommunikation",
      credentialCategory: "Bachelorabschluss",
      recognizedBy: {
        "@type": "CollegeOrUniversity",
        name: "Universität Passau",
      },
    },
    knowsAbout: [
      "Marketing",
      "E-Commerce",
      "Suchmaschinenoptimierung (SEO)",
      "Website-Content",
      "E-Mail-Marketing",
      "CRM",
      "Fotografie",
      "Künstliche Intelligenz und kreative Praxis",
    ],
    sameAs: [
      "https://at.linkedin.com/in/fabian-deragisch-57769a2a2",
      "https://www.instagram.com/FabianDeragisch/",
    ],
    subjectOf: {
      "@id": absoluteUrl(thesisPath, siteUrl),
    },
  },
});

export const createThesisSchema = (siteUrl: URL): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": absoluteUrl(thesisPath, siteUrl),
  url: absoluteUrl("/bachelorarbeit/", siteUrl),
  name: profile.thesis.title,
  alternateName: "Kreative Synergien",
  description: profile.thesis.summary,
  abstract: profile.thesis.summary,
  author: personReference(siteUrl),
  creator: personReference(siteUrl),
  dateCreated: "2024",
  inLanguage: "de",
  isAccessibleForFree: true,
  about: [
    "Künstliche Intelligenz",
    "Kunst",
    "Kreativität",
    "Mensch-Maschine-Zusammenarbeit",
    "Urheberrecht",
  ],
  isPartOf: {
    "@id": absoluteUrl(pagePath, siteUrl),
  },
  associatedMedia: {
    "@type": "MediaObject",
    contentUrl: absoluteUrl(
      "/bachelorarbeit-fabian-deragisch/Kreative%20Synergien_Bachelorarbeit_Fabian%20Deragisch.pdf",
      siteUrl,
    ),
    encodingFormat: "application/pdf",
  },
});

export const createGallerySchema = (siteUrl: URL, images: GalleryImage[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": absoluteUrl("/galerie/#fotogalerie", siteUrl),
  url: absoluteUrl("/galerie/", siteUrl),
  name: "Favorite Shots | Fabian Deragisch",
  description: "Eine wachsende Auswahl an Fotografien von Fabian Deragisch.",
  inLanguage: "de-AT",
  creator: personReference(siteUrl),
  isPartOf: {
    "@id": absoluteUrl(pagePath, siteUrl),
  },
  associatedMedia: images.map((image) => ({
    "@type": "ImageObject",
    contentUrl: image.url,
    name: image.title,
    description: image.description,
    creator: personReference(siteUrl),
  })),
});

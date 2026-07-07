// Server-rendered JSON-LD helpers. Every builder returns a plain schema.org
// node (no @context — that lives once at the top level); render one or more
// nodes with <JsonLd>. Keep markup honest: only describe content the page
// actually renders (Google's structured-data guideline).

export const BASE_URL = 'https://pubquizplanner.com';

// Stable @ids so nodes can cross-reference (WebSite -> Organization publisher)
// and search engines can de-dupe the site-wide entities across pages.
const ORG_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

type JsonLdNode = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ListItemInput {
  name: string;
  url: string;
  /** Live count of items behind this entry (e.g. questions in a category). */
  numberOfItems?: number;
}

export function organizationSchema(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'PubQuizPlanner',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/apple-icon`,
      width: 180,
      height: 180,
    },
  };
}

export function websiteSchema(locale: string): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'PubQuizPlanner',
    url: `${BASE_URL}/${locale}`,
    inLanguage: locale,
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListSchema(items: ListItemInput[]): JsonLdNode {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => {
      const node: JsonLdNode = {
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      };
      if (typeof item.numberOfItems === 'number') {
        node.numberOfItems = item.numberOfItems;
      }
      return node;
    }),
  };
}

export function faqPageSchema(items: FaqItem[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// Prevent a stray "</script>" inside question/answer text from breaking out of
// the inline <script> tag. Escaping "<" is sufficient and keeps valid JSON.
function serialize(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

// Render one node or several. Multiple nodes are wrapped in an @graph so the
// whole page emits a single <script> with one shared @context.
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const payload = Array.isArray(data)
    ? { '@context': 'https://schema.org', '@graph': data }
    : { '@context': 'https://schema.org', ...data };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(payload) }}
    />
  );
}

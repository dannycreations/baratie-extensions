import { CATEGORY_WEB } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface GoogleDorkSpice {
  readonly allInAnchor: string;
  readonly allInText: string;
  readonly allInTitle: string;
  readonly allInUrl: string;
  readonly anyInAnchor: string;
  readonly anyInText: string;
  readonly anyInTitle: string;
  readonly anyInUrl: string;
  readonly aroundDistance: number;
  readonly isAround: boolean;
  readonly aroundTerm1: string;
  readonly aroundTerm2: string;
  readonly dateAfter: string;
  readonly dateBefore: string;
  readonly isDateFiltered: boolean;
  readonly defineTerm: string;
  readonly exactPhrase: string;
  readonly excludedTerms: string;
  readonly fileType: string;
  readonly mainQuery: string;
  readonly isNumberRange: boolean;
  readonly numberRangeEnd: string;
  readonly numberRangePrefix: string;
  readonly numberRangeStart: string;
  readonly siteFilter: string;
}

const googleDorkSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'mainQuery',
    label: 'Base Keywords',
    type: 'string',
    value: '',
    placeholder: 'e.g., recipe ideas, "specific topic"',
    description: 'Enter the base keywords for the search. Supports "OR" logic and "exact phrases".',
  },
  {
    id: 'exactPhrase',
    label: 'Exact Phrase to Include',
    type: 'string',
    value: '',
    placeholder: 'e.g., "artificial intelligence research"',
    description: 'Specify an exact phrase to include. Use an asterisk (*) for wildcards inside the phrase.',
  },
  {
    id: 'excludedTerms',
    label: 'Exclude Terms or Sites',
    type: 'string',
    value: '',
    placeholder: 'e.g., -photography -site:example.com',
    description: 'Enter terms or sites to exclude, separated by spaces (e.g., -site:example.com).',
  },
  {
    id: 'siteFilter',
    label: 'Search Specific Site(s)',
    type: 'string',
    value: '',
    placeholder: 'e.g., nytimes.com, .edu, *.gov',
    description: 'Restrict the search to specific sites or domains (e.g., .edu, nytimes.com).',
  },
  {
    id: 'allInTitle',
    label: 'ALL These Words in Title',
    type: 'string',
    value: '',
    placeholder: 'e.g., budget travel europe',
    description: 'All words must appear in the page title. Ideal for focused searches (allintitle:).',
  },
  {
    id: 'anyInTitle',
    label: 'ANY of These Words in Title',
    type: 'string',
    value: '',
    placeholder: 'e.g., report annual meeting',
    description: 'Any of the specified words can appear in the page title (intitle:).',
  },
  {
    id: 'allInText',
    label: 'ALL These Words in Text',
    type: 'string',
    value: '',
    placeholder: 'e.g., healthy vegan recipes',
    description: 'All words must appear in the page text. Ideal for focused searches (allintext:).',
  },
  {
    id: 'anyInText',
    label: 'ANY of These Words in Text',
    type: 'string',
    value: '',
    placeholder: 'e.g., review guide tutorial',
    description: 'Any of the specified words can appear in the page text (intext:).',
  },
  {
    id: 'allInUrl',
    label: 'ALL These Words in URL',
    type: 'string',
    value: '',
    placeholder: 'e.g., company blog article',
    description: 'All words must appear in the URL. Ideal for focused searches (allinurl:).',
  },
  {
    id: 'anyInUrl',
    label: 'ANY of These Words in URL',
    type: 'string',
    value: '',
    placeholder: 'e.g., download pdf guide',
    description: 'Any of the specified words can appear in the URL (inurl:).',
  },
  {
    id: 'allInAnchor',
    label: 'ALL Words in Link Anchors',
    type: 'string',
    value: '',
    placeholder: 'e.g., official download page',
    description: 'All words must appear in link anchors. Ideal for focused searches (allinanchor:).',
  },
  {
    id: 'anyInAnchor',
    label: 'ANY Words in Link Anchors',
    type: 'string',
    value: '',
    placeholder: 'e.g., source code repository',
    description: 'Any of the specified words can appear in link anchors (inanchor:).',
  },
  {
    id: 'isAround',
    label: 'Enable AROUND Operator',
    type: 'boolean',
    value: false,
    description: 'Find terms within a specified word proximity using the AROUND operator.',
  },
  {
    id: 'aroundTerm1',
    label: 'AROUND: Term 1',
    type: 'string',
    value: '',
    placeholder: 'e.g., climate',
    dependsOn: [{ spiceId: 'isAround', value: true }],
  },
  {
    id: 'aroundDistance',
    label: 'AROUND: Max Words Between',
    type: 'number',
    value: 5,
    min: 1,
    dependsOn: [{ spiceId: 'isAround', value: true }],
  },
  {
    id: 'aroundTerm2',
    label: 'AROUND: Term 2',
    type: 'string',
    value: '',
    placeholder: 'e.g., change',
    dependsOn: [{ spiceId: 'isAround', value: true }],
  },
  {
    id: 'isDateFiltered',
    label: 'Enable Date Filters',
    type: 'boolean',
    value: false,
    description: 'Filter results by a specific date range (before:/after:).',
  },
  {
    id: 'dateBefore',
    label: 'Results Before Date',
    type: 'string',
    value: '',
    placeholder: 'YYYY-MM-DD or YYYY',
    dependsOn: [{ spiceId: 'isDateFiltered', value: true }],
  },
  {
    id: 'dateAfter',
    label: 'Results After Date',
    type: 'string',
    value: '',
    placeholder: 'YYYY-MM-DD or YYYY',
    dependsOn: [{ spiceId: 'isDateFiltered', value: true }],
  },
  {
    id: 'defineTerm',
    label: 'Define a Term',
    type: 'string',
    value: '',
    placeholder: 'e.g., serendipity',
    description: 'Find definitions for a specific term (define:).',
  },
  {
    id: 'fileType',
    label: 'File Type (Extension)',
    type: 'string',
    value: '',
    placeholder: 'e.g., pdf, docx (no dot)',
    description: 'Search for specific file extensions (e.g., pdf, docx).',
  },
  {
    id: 'isNumberRange',
    label: 'Enable Number Range',
    type: 'boolean',
    value: false,
    description: 'Search for a range of numbers (e.g., 50..100).',
  },
  {
    id: 'numberRangePrefix',
    label: 'Range Context (Optional)',
    type: 'string',
    value: '',
    placeholder: 'e.g., camera megapixels',
    dependsOn: [{ spiceId: 'isNumberRange', value: true }],
    description: 'Provide context for the number range (e.g., "price", "year").',
  },
  {
    id: 'numberRangeStart',
    label: 'Range Start',
    type: 'string',
    value: '',
    placeholder: 'e.g., 50 or $50',
    dependsOn: [{ spiceId: 'isNumberRange', value: true }],
  },
  {
    id: 'numberRangeEnd',
    label: 'Range End',
    type: 'string',
    value: '',
    placeholder: 'e.g., 100 or $100',
    dependsOn: [{ spiceId: 'isNumberRange', value: true }],
  },
];

// Builds a search query part with a given prefix if the value is not empty.
function buildTermOperator(value: string | undefined, prefix: string, isExact: boolean = false): string[] {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return [];
  }
  if (isExact) {
    return [`${prefix}"${trimmed}"`];
  }
  // For 'any' type operators like intitle:, intext:, etc.
  if (prefix.endsWith(':') && prefix !== 'allintitle:' && prefix !== 'allintext:' && prefix !== 'allinurl:' && prefix !== 'allinanchor:') {
    return trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `${prefix}${term}`);
  }
  return [`${prefix}${trimmed}`];
}

// Builds the AROUND operator query part.
function buildAroundOperator(spices: GoogleDorkSpice): string[] {
  const term1 = (spices.aroundTerm1 || '').trim();
  const term2 = (spices.aroundTerm2 || '').trim();
  if (spices.isAround && term1 && term2 && spices.aroundDistance !== undefined && spices.aroundDistance > 0) {
    return [`${term1} AROUND(${spices.aroundDistance}) ${term2}`];
  }
  return [];
}

// Builds the date filter query parts (before: and after:).
function buildDateFilters(spices: GoogleDorkSpice): string[] {
  const parts: string[] = [];
  if (spices.isDateFiltered) {
    const dateBefore = (spices.dateBefore || '').trim();
    if (dateBefore) parts.push(`before:${dateBefore}`);
    const dateAfter = (spices.dateAfter || '').trim();
    if (dateAfter) parts.push(`after:${dateAfter}`);
  }
  return parts;
}

// Builds the number range query part (e.g., 10..100).
function buildNumberRange(spices: GoogleDorkSpice): string[] {
  const start = (spices.numberRangeStart || '').trim();
  const end = (spices.numberRangeEnd || '').trim();
  if (spices.isNumberRange && start && end) {
    const prefix = (spices.numberRangePrefix || '').trim();
    return [`${prefix ? prefix + ' ' : ''}${start}..${end}`];
  }
  return [];
}

const googleDorkDefinition: IngredientDefinition<GoogleDorkSpice> = {
  name: 'Google Dork',
  category: CATEGORY_WEB,
  description: 'Constructs Google Dork queries using various operators.',
  spices: googleDorkSpices,
  run: (input, spices) => {
    const queryParts: string[] = [];

    // Main query and exact phrase.
    queryParts.push(...buildTermOperator(spices.mainQuery, ''));
    queryParts.push(...buildTermOperator(spices.exactPhrase, '', true));

    // Title operators.
    queryParts.push(...buildTermOperator(spices.allInTitle, 'allintitle:'));
    queryParts.push(...buildTermOperator(spices.anyInTitle, 'intitle:'));

    // Text operators.
    queryParts.push(...buildTermOperator(spices.allInText, 'allintext:'));
    queryParts.push(...buildTermOperator(spices.anyInText, 'intext:'));

    // URL operators.
    queryParts.push(...buildTermOperator(spices.allInUrl, 'allinurl:'));
    queryParts.push(...buildTermOperator(spices.anyInUrl, 'inurl:'));

    // Anchor operators.
    queryParts.push(...buildTermOperator(spices.allInAnchor, 'allinanchor:'));
    queryParts.push(...buildTermOperator(spices.anyInAnchor, 'inanchor:'));

    // Excluded terms.
    queryParts.push(...buildTermOperator(spices.excludedTerms, '-'));

    // Site filter.
    queryParts.push(...buildTermOperator(spices.siteFilter, 'site:'));

    // AROUND operator.
    queryParts.push(...buildAroundOperator(spices));

    // Date filters.
    queryParts.push(...buildDateFilters(spices));

    // Define term.
    queryParts.push(...buildTermOperator(spices.defineTerm, 'define:'));

    // File type.
    const fileTypeTrimmed = (spices.fileType || '').trim();
    if (fileTypeTrimmed) {
      queryParts.push(`filetype:${fileTypeTrimmed.replace(/^\./, '')}`);
    }

    // Number range.
    queryParts.push(...buildNumberRange(spices));

    // Join all parts and clean up extra spaces.
    return input.update(
      queryParts
        .filter(Boolean)
        .join(' ')
        .trim()
        .replace(/\s{2,}/g, ' '),
    );
  },
};

Baratie.ingredient.register(googleDorkDefinition);

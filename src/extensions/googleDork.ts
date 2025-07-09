import { CATEGORY_WEB_TOOLS, KEY_GOOGLE_DORK } from '../core/constants';

import type { IngredientDefinition, InputType, ResultType, SpiceDefinition } from 'baratie';

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

const GOOGLE_DORK_SPICES: readonly SpiceDefinition[] = [
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

function buildAllInTerm(value: string | undefined, prefix: string): string[] {
  const trimmed = value?.trim();
  return trimmed ? [`${prefix}${trimmed}`] : [];
}

function buildAnyInTerm(value: string | undefined, prefix: string): string[] {
  const trimmed = value?.trim();
  if (!trimmed) {
    return [];
  }
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((term: string): string => `${prefix}${term}`);
}

function runGoogleDork(input: InputType<unknown>, spices: GoogleDorkSpice): ResultType<string> {
  const queryParts: string[] = [];

  if (spices.mainQuery?.trim()) {
    queryParts.push(spices.mainQuery.trim());
  }
  if (spices.exactPhrase?.trim()) {
    queryParts.push(`"${spices.exactPhrase.trim()}"`);
  }

  queryParts.push(...buildAllInTerm(spices.allInTitle, 'allintitle:'));
  queryParts.push(...buildAnyInTerm(spices.anyInTitle, 'intitle:'));
  queryParts.push(...buildAllInTerm(spices.allInText, 'allintext:'));
  queryParts.push(...buildAnyInTerm(spices.anyInText, 'intext:'));
  queryParts.push(...buildAllInTerm(spices.allInUrl, 'allinurl:'));
  queryParts.push(...buildAnyInTerm(spices.anyInUrl, 'inurl:'));
  queryParts.push(...buildAllInTerm(spices.allInAnchor, 'allinanchor:'));
  queryParts.push(...buildAnyInTerm(spices.anyInAnchor, 'inanchor:'));
  queryParts.push(...buildAnyInTerm(spices.excludedTerms, '-'));

  if (spices.siteFilter?.trim()) {
    queryParts.push(`site:${spices.siteFilter.trim()}`);
  }

  if (spices.isAround && spices.aroundTerm1?.trim() && spices.aroundTerm2?.trim() && spices.aroundDistance && spices.aroundDistance > 0) {
    queryParts.push(`${spices.aroundTerm1.trim()} AROUND(${spices.aroundDistance}) ${spices.aroundTerm2.trim()}`);
  }

  if (spices.isDateFiltered) {
    if (spices.dateBefore?.trim()) queryParts.push(`before:${spices.dateBefore.trim()}`);
    if (spices.dateAfter?.trim()) queryParts.push(`after:${spices.dateAfter.trim()}`);
  }

  if (spices.defineTerm?.trim()) {
    queryParts.push(`define:${spices.defineTerm.trim()}`);
  }

  if (spices.fileType?.trim()) {
    queryParts.push(`filetype:${spices.fileType.trim().replace(/^\./, '')}`);
  }

  if (spices.isNumberRange && spices.numberRangeStart?.trim() && spices.numberRangeEnd?.trim()) {
    const rangePrefix = spices.numberRangePrefix?.trim() ? `${spices.numberRangePrefix.trim()} ` : '';
    queryParts.push(`${rangePrefix}${spices.numberRangeStart.trim()}..${spices.numberRangeEnd.trim()}`);
  }

  const query: string = queryParts
    .join(' ')
    .trim()
    .replace(/\s{2,}/g, ' ');
  return input.update(query);
}

const GOOGLE_DORK_DEFINITION: IngredientDefinition<GoogleDorkSpice, unknown, string> = {
  id: KEY_GOOGLE_DORK,
  name: 'Google Dork',
  category: CATEGORY_WEB_TOOLS,
  description: 'Constructs advanced Google Dork queries using various operators.',
  spices: GOOGLE_DORK_SPICES,
  run: runGoogleDork,
};

Baratie.ingredientRegistry.registerIngredient(GOOGLE_DORK_DEFINITION);

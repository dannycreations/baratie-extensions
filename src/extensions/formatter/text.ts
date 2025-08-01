import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface TextSpice {
  // Core Operation Type
  readonly operationType: 'prefixSuffix' | 'findReplace' | 'cleanText' | 'reverseText' | 'extractLines' | 'extractByRegex';

  // Prefix/Suffix Operation Spices
  readonly prefixText?: string;
  readonly suffixText?: string;
  readonly addNumbers?: boolean;
  readonly startNumber?: number;
  readonly lineNumberSeparator?: string;

  // Find and Replace Operation Spices
  readonly findText?: string;
  readonly replaceText?: string;
  readonly caseSensitive?: boolean;
  readonly isRegex?: boolean;

  // Reverse Text Operation Spices
  readonly reverseUnit?: 'character' | 'word' | 'line';

  // Extract Lines Operation Spices
  readonly extractStartLine?: number;
  readonly extractEndLine?: number;

  // Extract by Regex Operation Spices
  readonly regexPattern?: string;
  readonly regexFlags?: string;
  readonly outputFormat?: 'fullMatch' | 'captureGroup1' | 'allMatchesCommaSeparated' | 'allMatchesNewLine';

  // Clean Text Operation Spices
  readonly cleanText?:
    | 'trimCharacters'
    | 'removeLeadingSpaces'
    | 'removeTrailingSpaces'
    | 'replaceSpacesWithTabs'
    | 'replaceTabsWithSpaces'
    | 'removeBlankEmptyLines'
    | 'replaceLineBreakWithSpace'
    | 'multipleSpacesToSingle'
    | 'multipleBlankLinesToSingle'
    | 'removeAllLineBreaks'
    | 'removeDuplicateLines'
    | 'removeRepeatingWords'
    | 'removeNonAscii'
    | 'removeNonAlphanumeric';
  readonly trimCharacters?: 'trimWhitespace' | 'removeLeftCharacters' | 'removeRightCharacters';
  readonly trimCharacterAmount?: number;
  readonly numberOfSpaces?: number;
}

const prefixSuffixSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'prefixText',
    label: 'Prefix Text',
    type: 'string',
    value: '',
    placeholder: 'Text to add at the beginning',
    description: 'Text to add as a prefix to the input.',
    dependsOn: [{ spiceId: 'operationType', value: 'prefixSuffix' }],
  },
  {
    id: 'suffixText',
    label: 'Suffix Text',
    type: 'string',
    value: '',
    placeholder: 'Text to add at the end',
    description: 'Text to add as a suffix to the input.',
    dependsOn: [{ spiceId: 'operationType', value: 'prefixSuffix' }],
  },
  {
    id: 'addNumbers',
    label: 'Add Line Numbers',
    type: 'boolean',
    value: false,
    description: 'If enabled, line numbers will be added to each line.',
    dependsOn: [{ spiceId: 'operationType', value: 'prefixSuffix' }],
  },
  {
    id: 'startNumber',
    label: 'Starting Line Number',
    type: 'number',
    value: 1,
    min: 0,
    step: 1,
    description: 'The number to start counting lines from when adding line numbers.',
    dependsOn: [
      { spiceId: 'operationType', value: 'prefixSuffix' },
      { spiceId: 'addNumbers', value: true },
    ],
  },
  {
    id: 'lineNumberSeparator',
    label: 'Line Number Separator',
    type: 'string',
    value: '. ',
    placeholder: '. ',
    description: 'The separator between the line number and the line content (e.g., ". ", ": ", " - ").',
    dependsOn: [
      { spiceId: 'operationType', value: 'prefixSuffix' },
      { spiceId: 'addNumbers', value: true },
    ],
  },
];

const findReplaceSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'findText',
    label: 'Find Text',
    type: 'string',
    value: '',
    placeholder: 'Text to find',
    description: 'The text to search for within the input.',
    dependsOn: [{ spiceId: 'operationType', value: 'findReplace' }],
  },
  {
    id: 'replaceText',
    label: 'Replace With',
    type: 'string',
    value: '',
    placeholder: 'Text to replace with',
    description: 'The text to replace found instances with.',
    dependsOn: [{ spiceId: 'operationType', value: 'findReplace' }],
  },
  {
    id: 'caseSensitive',
    label: 'Case Sensitive',
    type: 'boolean',
    value: false,
    description: 'Perform a case-sensitive find and replace.',
    dependsOn: [{ spiceId: 'operationType', value: 'findReplace' }],
  },
  {
    id: 'isRegex',
    label: 'Treat Find Text as Regex',
    type: 'boolean',
    value: false,
    description: 'If enabled, "Find Text" will be interpreted as a regular expression.',
    dependsOn: [{ spiceId: 'operationType', value: 'findReplace' }],
  },
];

const cleanTextSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'cleanText',
    label: 'Cleaning Operation',
    type: 'select',
    value: 'trimCharacters',
    options: [
      { label: 'Trim Characters', value: 'trimCharacters' },
      { label: 'Remove Leading Spaces', value: 'removeLeadingSpaces' },
      { label: 'Remove Trailing Spaces', value: 'removeTrailingSpaces' },
      { label: 'Replace Spaces with Tabs', value: 'replaceSpacesWithTabs' },
      { label: 'Replace Tabs with Spaces', value: 'replaceTabsWithSpaces' },
      { label: 'Remove Blank/Empty Lines', value: 'removeBlankEmptyLines' },
      { label: 'Replace Line Break with Space', value: 'replaceLineBreakWithSpace' },
      { label: 'Multiple Spaces to Single', value: 'multipleSpacesToSingle' },
      { label: 'Multiple Blank Lines to Single', value: 'multipleBlankLinesToSingle' },
      { label: 'Remove All Line Breaks', value: 'removeAllLineBreaks' },
      { label: 'Remove Duplicate Lines/Paragraphs', value: 'removeDuplicateLines' },
      { label: 'Remove Repeating Words', value: 'removeRepeatingWords' },
      { label: 'Remove Non-ASCII Characters', value: 'removeNonAscii' },
      { label: 'Remove Non-Alphanumeric Characters', value: 'removeNonAlphanumeric' },
    ],
    description: 'Select the specific cleaning operation to perform.',
    dependsOn: [{ spiceId: 'operationType', value: 'cleanText' }],
  },
  {
    id: 'trimCharacters',
    label: 'Trim Type',
    type: 'select',
    value: 'trimWhitespace',
    options: [
      { label: 'Trim Whitespace', value: 'trimWhitespace' },
      { label: 'Remove Left Characters', value: 'removeLeftCharacters' },
      { label: 'Remove Right Characters', value: 'removeRightCharacters' },
    ],
    description: 'Select the specific character trimming operation to perform.',
    dependsOn: [
      { spiceId: 'operationType', value: 'cleanText' },
      { spiceId: 'cleanText', value: 'trimCharacters' },
    ],
  },
  {
    id: 'trimCharacterAmount',
    label: 'Amount',
    type: 'number',
    value: 1,
    min: 0,
    step: 1,
    description: 'The number of characters to remove from the specified side.',
    dependsOn: [
      { spiceId: 'operationType', value: 'cleanText' },
      { spiceId: 'cleanText', value: 'trimCharacters' },
      { spiceId: 'trimCharacters', value: ['removeLeftCharacters', 'removeRightCharacters'] },
    ],
  },
  {
    id: 'numberOfSpaces',
    label: 'Number of Spaces',
    type: 'number',
    value: 4,
    min: 1,
    step: 1,
    description: 'Number of spaces for tab/space conversion.',
    dependsOn: [
      { spiceId: 'operationType', value: 'cleanText' },
      { spiceId: 'cleanText', value: ['replaceSpacesWithTabs', 'replaceTabsWithSpaces'] },
    ],
  },
];

const reverseTextSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'reverseUnit',
    label: 'Reverse By',
    type: 'select',
    value: 'character',
    options: [
      { label: 'Character', value: 'character' },
      { label: 'Word', value: 'word' },
      { label: 'Line', value: 'line' },
    ],
    description: 'Determines how the text is reversed.',
    dependsOn: [{ spiceId: 'operationType', value: 'reverseText' }],
  },
];

const extractLinesSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'extractStartLine',
    label: 'Start Line (1-based)',
    type: 'number',
    value: 1,
    min: 1,
    step: 1,
    description: 'The 1-based starting line number to extract.',
    dependsOn: [{ spiceId: 'operationType', value: 'extractLines' }],
  },
  {
    id: 'extractEndLine',
    label: 'End Line (1-based)',
    type: 'number',
    value: 10,
    min: 1,
    step: 1,
    description: 'The 1-based ending line number to extract.',
    dependsOn: [{ spiceId: 'operationType', value: 'extractLines' }],
  },
];

const extractByRegexSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'regexPattern',
    label: 'Regex Pattern',
    type: 'string',
    value: '',
    placeholder: 'e.g., \\d+',
    description: 'The regular expression pattern to search for.',
    dependsOn: [{ spiceId: 'operationType', value: 'extractByRegex' }],
  },
  {
    id: 'regexFlags',
    label: 'Regex Flags',
    type: 'string',
    value: 'g',
    placeholder: 'e.g., gi',
    description: 'Flags for the regular expression (e.g., g for global, i for case-insensitive, m for multiline).',
    dependsOn: [{ spiceId: 'operationType', value: 'extractByRegex' }],
  },
  {
    id: 'outputFormat',
    label: 'Output Format',
    type: 'select',
    value: 'fullMatch',
    options: [
      { label: 'Full Match', value: 'fullMatch' },
      { label: 'First Capture Group', value: 'captureGroup1' },
      { label: 'All Matches (Comma Separated)', value: 'allMatchesCommaSeparated' },
      { label: 'All Matches (New Line)', value: 'allMatchesNewLine' },
    ],
    description: 'How to format the extracted regex matches.',
    dependsOn: [{ spiceId: 'operationType', value: 'extractByRegex' }],
  },
];

const textSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'operationType',
    label: 'Operation Type',
    type: 'select',
    value: 'prefixSuffix',
    options: [
      { label: 'Add Prefix/Suffix', value: 'prefixSuffix' },
      { label: 'Find and Replace', value: 'findReplace' },
      { label: 'Clean Text', value: 'cleanText' },
      { label: 'Reverse Text', value: 'reverseText' },
      { label: 'Extract Lines by Range', value: 'extractLines' },
      { label: 'Extract by Regex', value: 'extractByRegex' },
    ],
    description: 'Select the type of text manipulation to perform.',
  },
  ...prefixSuffixSpices,
  ...findReplaceSpices,
  ...cleanTextSpices,
  ...reverseTextSpices,
  ...extractLinesSpices,
  ...extractByRegexSpices,
];

// Handles prefix and suffix operations, including optional line numbering.
function applyPrefixSuffix(inputValue: string, spices: TextSpice): string {
  const prefix = spices.prefixText || '';
  const suffix = spices.suffixText || '';
  let processedValue = inputValue;

  if (spices.addNumbers) {
    const lines = inputValue.split('\n');
    const startNum = spices.startNumber !== undefined ? spices.startNumber : 1;
    const separator = spices.lineNumberSeparator || '. ';
    processedValue = lines.map((line, index) => `${startNum + index}${separator}${line}`).join('\n');
  }
  return `${prefix}${processedValue}${suffix}`;
}

// Handles find and replace operations, supporting regex and case sensitivity.
function applyFindReplace(inputValue: string, spices: TextSpice): string {
  const find = spices.findText || '';
  const replace = spices.replaceText || '';
  if (!find) {
    return inputValue;
  }

  // Always global for find/replace
  let flags = 'g';
  let searchPattern = find;

  if (spices.isRegex) {
    // If it's a regex, caseSensitive controls 'i' flag
    flags += spices.caseSensitive ? '' : 'i';
  } else {
    // If not regex, escape special characters
    searchPattern = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!spices.caseSensitive) {
      // Add 'i' flag if not case sensitive for plain text search
      flags += 'i';
    }
  }
  const regex = new RegExp(searchPattern, flags);
  return inputValue.replace(regex, replace);
}

// Handles various text cleaning operations.
function applyCleanText(inputValue: string, spices: TextSpice): string {
  switch (spices.cleanText) {
    case 'trimCharacters':
      switch (spices.trimCharacters) {
        case 'trimWhitespace':
          return inputValue.trim();
        case 'removeLeftCharacters':
          const leftAmount = spices.trimCharacterAmount !== undefined ? spices.trimCharacterAmount : 0;
          return inputValue.substring(leftAmount);
        case 'removeRightCharacters':
          const rightAmount = spices.trimCharacterAmount !== undefined ? spices.trimCharacterAmount : 0;
          return inputValue.substring(0, inputValue.length - rightAmount);
        default:
          return inputValue;
      }
    case 'removeLeadingSpaces':
      return inputValue.replace(/^[ \t]+/gm, '');
    case 'removeTrailingSpaces':
      return inputValue.replace(/[ \t]+$/gm, '');
    case 'replaceSpacesWithTabs':
      const spacesForTab = spices.numberOfSpaces !== undefined ? spices.numberOfSpaces : 4;
      return inputValue.replace(new RegExp(` {${spacesForTab}}`, 'g'), '\t');
    case 'replaceTabsWithSpaces':
      const spacesForSpace = spices.numberOfSpaces !== undefined ? spices.numberOfSpaces : 4;
      return inputValue.replace(/\t/g, ' '.repeat(spacesForSpace));
    case 'removeBlankEmptyLines':
      return inputValue
        .split('\n')
        .filter((line) => line.trim() !== '')
        .join('\n');
    case 'replaceLineBreakWithSpace':
      return inputValue.replace(/(\r\n|\n|\r)/gm, ' ');
    case 'multipleSpacesToSingle':
      return inputValue.replace(/ {2,}/g, ' ');
    case 'multipleBlankLinesToSingle':
      return inputValue.replace(/(\r\n|\n|\r){2,}/g, '\n\n');
    case 'removeAllLineBreaks':
      return inputValue.replace(/(\r\n|\n|\r)/gm, '');
    case 'removeDuplicateLines':
      const lines = inputValue.split('\n');
      const uniqueLines = Array.from(new Set(lines)).join('\n');
      return uniqueLines;
    case 'removeRepeatingWords':
      return inputValue.replace(/\b(\w+)(?:\s+\1\b)+/g, '$1');
    case 'removeNonAscii':
      return inputValue.replace(/[^\x00-\x7F]/g, '');
    case 'removeNonAlphanumeric':
      return inputValue.replace(/[^a-zA-Z0-9]/g, '');
    default:
      return inputValue;
  }
}

// Reverses text by character, word, or line.
function applyReverseText(inputValue: string, spices: TextSpice): string {
  if (spices.reverseUnit === 'word') {
    return inputValue.split(/\s+/).reverse().join(' ');
  } else if (spices.reverseUnit === 'line') {
    return inputValue.split('\n').reverse().join('\n');
  } else {
    // character
    return inputValue.split('').reverse().join('');
  }
}

// Extracts lines from the input text based on a specified range.
function applyExtractLines(inputValue: string, spices: TextSpice): string {
  const allLines = inputValue.split('\n');
  // Adjust to 0-indexed and handle potential undefined values gracefully
  const startLine = Math.max(0, (spices.extractStartLine !== undefined ? spices.extractStartLine : 1) - 1);
  const endLine = Math.min(allLines.length - 1, (spices.extractEndLine !== undefined ? spices.extractEndLine : allLines.length) - 1);
  return allLines.slice(startLine, endLine + 1).join('\n');
}

// Extracts text using a regular expression, with various output formatting options.
function applyExtractByRegex(inputValue: string, spices: TextSpice): string {
  const pattern = spices.regexPattern || '';
  if (!pattern) {
    return '';
  }

  try {
    const flags = spices.regexFlags || 'g';
    const regex = new RegExp(pattern, flags);
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(inputValue)) !== null) {
      if (spices.outputFormat === 'captureGroup1' && match[1] !== undefined) {
        matches.push(match[1]);
      } else {
        // Full match
        matches.push(match[0]);
      }
    }

    if (spices.outputFormat === 'allMatchesCommaSeparated') {
      return matches.join(', ');
    } else if (spices.outputFormat === 'allMatchesNewLine') {
      return matches.join('\n');
    } else if (matches.length > 0) {
      // For fullMatch and captureGroup1, just take the first
      return matches[0];
    } else {
      return '';
    }
  } catch (e: unknown) {
    let errorMessage = 'An unknown error occurred.';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }

    console.error('Invalid regex pattern or flags:', e);
    return `Error: Invalid regex pattern or flags. ${errorMessage}`;
  }
}

const textDefinition: IngredientDefinition<TextSpice> = {
  name: 'Text',
  category: CATEGORY_FORMATTER,
  description: 'Performs various advanced text manipulation operations.',
  spices: textSpices,
  run: (input, spices) => {
    const inputValue = input.cast('string').value;
    if (!inputValue.trim()) {
      return input.warning();
    }

    switch (spices.operationType) {
      case 'prefixSuffix':
        return input.update(applyPrefixSuffix(inputValue, spices));
      case 'findReplace':
        return input.update(applyFindReplace(inputValue, spices));
      case 'cleanText':
        return input.update(applyCleanText(inputValue, spices));
      case 'reverseText':
        return input.update(applyReverseText(inputValue, spices));
      case 'extractLines':
        return input.update(applyExtractLines(inputValue, spices));
      case 'extractByRegex':
        return input.update(applyExtractByRegex(inputValue, spices));
      default:
        return input.update(inputValue);
    }
  },
};

Baratie.ingredient.register(textDefinition);

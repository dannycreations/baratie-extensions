import { CATEGORY_FORMATTER } from '../../core/constants';

import type { IngredientDefinition, SpiceDefinition } from 'baratie';

interface TextSpice {
  readonly operationType: 'prefixSuffix' | 'findReplace' | 'cleanText' | 'reverseText' | 'extractText';

  // Prefix/Suffix Operation Spices
  readonly prefixText?: string;
  readonly suffixText?: string;
  readonly addNumbers?: boolean;
  readonly startNumber?: number;
  readonly lineNumberSeparator?: string;
  readonly applyPerLine?: boolean;

  // Find and Replace Operation Spices
  readonly findText?: string;
  readonly replaceText?: string;
  readonly caseSensitive?: boolean;
  readonly isRegex?: boolean;

  // Reverse Text Operation Spices
  readonly reverseUnit?: 'character' | 'word' | 'line';

  // Extract Text Operation Spices
  readonly extractType?: 'byRange' | 'byRegex' | 'byCharAmount';
  readonly extractStartLine?: number;
  readonly extractEndLine?: number;
  readonly regexPattern?: string;
  readonly regexFlags?: string;
  readonly outputFormat?: 'fullMatch' | 'captureGroup1' | 'allMatchesCommaSeparated' | 'allMatchesNewLine';
  readonly extractCharAmount?: number;
  readonly extractCharFrom?: 'start' | 'end';

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
  {
    id: 'applyPerLine',
    label: 'Apply Per Line',
    type: 'boolean',
    value: false,
    description: 'If enabled, prefix and suffix will be applied to every line individually.',
    dependsOn: [{ spiceId: 'operationType', value: 'prefixSuffix' }],
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
      {
        label: 'Multiple Blank Lines to Single',
        value: 'multipleBlankLinesToSingle',
      },
      { label: 'Remove All Line Breaks', value: 'removeAllLineBreaks' },
      {
        label: 'Remove Duplicate Lines/Paragraphs',
        value: 'removeDuplicateLines',
      },
      { label: 'Remove Repeating Words', value: 'removeRepeatingWords' },
      { label: 'Remove Non-ASCII Characters', value: 'removeNonAscii' },
      {
        label: 'Remove Non-Alphanumeric Characters',
        value: 'removeNonAlphanumeric',
      },
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
      {
        spiceId: 'trimCharacters',
        value: ['removeLeftCharacters', 'removeRightCharacters'],
      },
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
      {
        spiceId: 'cleanText',
        value: ['replaceSpacesWithTabs', 'replaceTabsWithSpaces'],
      },
    ],
  },
];

const extractTextSpices: ReadonlyArray<SpiceDefinition> = [
  {
    id: 'extractType',
    label: 'Extraction Type',
    type: 'select',
    value: 'byRange',
    options: [
      { label: 'By Line Range', value: 'byRange' },
      { label: 'By Regex', value: 'byRegex' },
      { label: 'By Character Amount', value: 'byCharAmount' },
    ],
    description: 'Select whether to extract text by line range or by regular expression.',
    dependsOn: [{ spiceId: 'operationType', value: 'extractText' }],
  },
  {
    id: 'extractStartLine',
    label: 'Start Line (1-based)',
    type: 'number',
    value: 1,
    min: 1,
    step: 1,
    description: 'The 1-based starting line number to extract.',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byRange' },
    ],
  },
  {
    id: 'extractEndLine',
    label: 'End Line (1-based)',
    type: 'number',
    value: 10,
    min: 1,
    step: 1,
    description: 'The 1-based ending line number to extract.',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byRange' },
    ],
  },
  {
    id: 'extractCharAmount',
    label: 'Character Amount',
    type: 'number',
    value: 10,
    min: 1,
    step: 1,
    description: 'The number of characters to extract from the start or end of the text.',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byCharAmount' },
    ],
  },
  {
    id: 'extractCharFrom',
    label: 'Extract From',
    type: 'select',
    value: 'start',
    options: [
      { label: 'Start of Text', value: 'start' },
      { label: 'End of Text', value: 'end' },
    ],
    description: 'Specify whether to extract characters from the start or end of the text.',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byCharAmount' },
    ],
  },
  {
    id: 'regexPattern',
    label: 'Regex Pattern',
    type: 'string',
    value: '',
    placeholder: 'e.g., \\d+',
    description: 'The regular expression pattern to search for.',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byRegex' },
    ],
  },
  {
    id: 'regexFlags',
    label: 'Regex Flags',
    type: 'string',
    value: 'g',
    placeholder: 'e.g., gi',
    description: 'Flags for the regular expression (e.g., g for global, i for case-insensitive, m for multiline).',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byRegex' },
    ],
  },
  {
    id: 'outputFormat',
    label: 'Output Format',
    type: 'select',
    value: 'fullMatch',
    options: [
      { label: 'Full Match', value: 'fullMatch' },
      { label: 'First Capture Group', value: 'captureGroup1' },
      {
        label: 'All Matches (Comma Separated)',
        value: 'allMatchesCommaSeparated',
      },
      { label: 'All Matches (New Line)', value: 'allMatchesNewLine' },
    ],
    description: 'How to format the extracted regex matches.',
    dependsOn: [
      { spiceId: 'operationType', value: 'extractText' },
      { spiceId: 'extractType', value: 'byRegex' },
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
      { label: 'Extract Text', value: 'extractText' },
      { label: 'Reverse Text', value: 'reverseText' },
    ],
    description: 'Select the type of text manipulation to perform.',
  },
  ...prefixSuffixSpices,
  ...findReplaceSpices,
  ...cleanTextSpices,
  ...reverseTextSpices,
  ...extractTextSpices,
];

function applyPrefixSuffix(inputValue: string, spices: TextSpice): string {
  const prefix = spices.prefixText ?? '';
  const suffix = spices.suffixText ?? '';
  const lines = inputValue.split('\n');
  let processedLines = lines;

  if (spices.addNumbers) {
    const startNum = spices.startNumber ?? 1;
    const separator = spices.lineNumberSeparator ?? '. ';
    processedLines = processedLines.map((line, index) => `${startNum + index}${separator}${line}`);
  }

  if (spices.applyPerLine) {
    processedLines = processedLines.map((line) => `${prefix}${line}${suffix}`);
    return processedLines.join('\n');
  }

  return `${prefix}${processedLines.join('\n')}${suffix}`;
}

function applyFindReplace(inputValue: string, spices: TextSpice): string {
  const find = spices.findText ?? '';
  const replace = spices.replaceText ?? '';
  if (!find) {
    return inputValue;
  }

  // Always use the global flag for find/replace.
  let flags = 'g';
  if (!spices.caseSensitive) {
    flags += 'i';
  }

  const searchPattern = spices.isRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    const regex = new RegExp(searchPattern, flags);
    return inputValue.replace(regex, replace);
  } catch (error: unknown) {
    console.error('Invalid regex pattern for find/replace:', error);
    const message = error instanceof Error ? error.message : String(error);
    return `Error: Invalid regex pattern for find/replace. ${message}`;
  }
}

function applyCleanText(inputValue: string, spices: TextSpice): string {
  switch (spices.cleanText) {
    case 'trimCharacters': {
      switch (spices.trimCharacters) {
        case 'trimWhitespace':
          return inputValue.trim();
        case 'removeLeftCharacters': {
          const amount = spices.trimCharacterAmount ?? 0;
          return inputValue.substring(amount);
        }
        case 'removeRightCharacters': {
          const amount = spices.trimCharacterAmount ?? 0;
          return inputValue.substring(0, inputValue.length - amount);
        }
        default:
          return inputValue;
      }
    }
    case 'removeLeadingSpaces':
      return inputValue.replace(/^[ \t]+/gm, '');
    case 'removeTrailingSpaces':
      return inputValue.replace(/[ \t]+$/gm, '');
    case 'replaceSpacesWithTabs': {
      const spacesForTab = spices.numberOfSpaces ?? 4;
      return inputValue.replace(new RegExp(` {${spacesForTab}}`, 'g'), '\t');
    }
    case 'replaceTabsWithSpaces': {
      const spacesForTab = spices.numberOfSpaces ?? 4;
      return inputValue.replace(/\t/g, ' '.repeat(spacesForTab));
    }
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
    case 'removeDuplicateLines': {
      const lines = inputValue.split('\n');
      return Array.from(new Set(lines)).join('\n');
    }
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

function applyReverseText(inputValue: string, spices: TextSpice): string {
  if (spices.reverseUnit === 'word') {
    return inputValue.split(/\s+/).reverse().join(' ');
  } else if (spices.reverseUnit === 'line') {
    return inputValue.split('\n').reverse().join('\n');
  } else {
    return inputValue.split('').reverse().join('');
  }
}

function applyExtractText(inputValue: string, spices: TextSpice): string {
  if (spices.extractType === 'byRange') {
    const allLines = inputValue.split('\n');
    const startLine = Math.max(0, (spices.extractStartLine ?? 1) - 1);
    const endLine = Math.min(allLines.length, spices.extractEndLine ?? allLines.length);
    return allLines.slice(startLine, endLine).join('\n');
  } else if (spices.extractType === 'byCharAmount') {
    const amount = spices.extractCharAmount ?? 0;
    if (amount <= 0) {
      return inputValue;
    }
    if (spices.extractCharFrom === 'end') {
      return inputValue.slice(-amount);
    }
    return inputValue.slice(0, amount);
  } else if (spices.extractType === 'byRegex') {
    const pattern = spices.regexPattern ?? '';
    if (!pattern) {
      return '';
    }

    try {
      const flags = spices.regexFlags ?? 'g';
      const regex = new RegExp(pattern, flags);
      const matches: string[] = [];
      let match;

      while ((match = regex.exec(inputValue)) !== null) {
        if (spices.outputFormat === 'captureGroup1' && match[1] !== undefined) {
          matches.push(match[1]);
        } else {
          matches.push(match[0]);
        }
      }

      if (spices.outputFormat === 'allMatchesCommaSeparated') {
        return matches.join(', ');
      } else if (spices.outputFormat === 'allMatchesNewLine') {
        return matches.join('\n');
      } else {
        return matches[0] ?? '';
      }
    } catch (error: unknown) {
      console.error('Invalid regex pattern or flags:', error);
      const message = error instanceof Error ? error.message : String(error);
      return `Error: Invalid regex pattern or flags. ${message}`;
    }
  }
  return inputValue;
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
      case 'extractText':
        return input.update(applyExtractText(inputValue, spices));
      default:
        return input.update(inputValue);
    }
  },
};

Baratie.ingredient.register(textDefinition);

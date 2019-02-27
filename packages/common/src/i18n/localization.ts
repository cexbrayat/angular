/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {Plural, getLocalePluralCase} from './locale_data_api';

/**
 * @publicApi
 */
export abstract class NgLocalization {
  abstract getPluralCategory(value: any, locale?: string): string;
}

const _INTERPOLATION_REGEXP: RegExp = /#/g;

function _getPluralKey(value: number, pluralMap: {[count: string]: string}, locale: string) {
  if (value == null) return '';

  const cases = Object.keys(pluralMap);
  let key = `=${value}`;

  if (cases.indexOf(key) > -1) {
    return key;
  }

  key = _getPluralCategory(value, locale);

  if (cases.indexOf(key) > -1) {
    return key;
  }

  if (cases.indexOf('other') > -1) {
    return 'other';
  }

  throw new Error(`No plural message found for value "${value}"`);
}

/**
 * @ngModule CommonModule
 * @description
 *
 * Maps a value to a string that pluralizes the value according to locale rules.
 *
 * @param value the number to be formatted
 * @param pluralMap an object that mimics the ICU format, see
 * http://userguide.icu-project.org/formatparse/messages.
 * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
 * default).
 *
 * @usageNotes
 * ### Manually set the errors for a control
 *
 * ```
 * const MESSAGES = {'=0': 'No messages.', '=1': 'One message.', 'other': '# messages.'};
 * const twoMessages = formatPlural(2, MESSAGES);
 * expect(twoMessages).toBe('2 messages.');
 *
 * ```
 *
 * @publicApi
 */
export function formatPlural(value: number, pluralMap: {[count: string]: string}, locale: string): string {
  const key = _getPluralKey(value, pluralMap, locale);
  if (key) {
    return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
  }
  return '';
}


/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(
    value: number, cases: string[], ngLocalization: NgLocalization, locale?: string): string {
  let key = `=${value}`;

  if (cases.indexOf(key) > -1) {
    return key;
  }

  key = ngLocalization.getPluralCategory(value, locale);

  if (cases.indexOf(key) > -1) {
    return key;
  }

  if (cases.indexOf('other') > -1) {
    return 'other';
  }

  throw new Error(`No plural message found for value "${value}"`);
}

function _getPluralCategory(value: any, locale: string) {
  const plural = getLocalePluralCase(locale || this.locale)(value);
  switch (plural) {
    case Plural.Zero:
      return 'zero';
    case Plural.One:
      return 'one';
    case Plural.Two:
      return 'two';
    case Plural.Few:
      return 'few';
    case Plural.Many:
      return 'many';
    default:
      return 'other';
  }
}

/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
@Injectable()
export class NgLocaleLocalization extends NgLocalization {
  constructor(
      @Inject(LOCALE_ID) protected locale: string
  ) {
    super();
  }

  getPluralCategory(value: any, locale?: string): string {
    return _getPluralCategory(value, locale || this.locale);
  }
}

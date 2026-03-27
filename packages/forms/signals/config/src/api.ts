/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Injector, type Provider, type Signal} from '@angular/core';
import {SIGNAL_FORMS_CONFIG} from './di';

/**
 * The subset of field state APIs used by signal forms CSS class configuration.
 *
 * @experimental 21.0.1
 */
export interface SignalFormsClassBindingState {
  touched(): boolean;
  dirty(): boolean;
  valid(): boolean;
  invalid(): boolean;
  pending(): boolean;
}

/**
 * The binding context passed to `SignalFormsConfig.classes` predicates.
 *
 * @experimental 21.0.1
 */
export interface SignalFormsClassBinding {
  readonly element: HTMLElement;
  readonly injector: Injector;
  readonly state: Signal<SignalFormsClassBindingState>;
  focus(options?: FocusOptions): void;
}

/**
 * Configuration options for signal forms.
 *
 * @experimental 21.0.1
 */
export interface SignalFormsConfig {
  /** A map of CSS class names to predicate functions that determine when to apply them. */
  classes?: {
    [className: string]: (formField: SignalFormsClassBinding) => boolean;
  };
}

/**
 * Provides configuration options for signal forms.
 *
 * @experimental 21.0.1
 */
export function provideSignalFormsConfig(config: SignalFormsConfig): Provider[] {
  return [{provide: SIGNAL_FORMS_CONFIG, useValue: config}];
}

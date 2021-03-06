/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, NgModule, Optional} from '@angular/core';

import {HttpBackend, HttpHandler} from './backend';
import {HttpClient} from './client';
import {HTTP_INTERCEPTORS, HttpInterceptor, HttpInterceptorHandler} from './interceptor';
import {JSONP_HOME, JsonpCallbackMap, JsonpClientBackend, JsonpInterceptor} from './jsonp';
import {BrowserXhr, HttpXhrBackend, XhrFactory} from './xhr';


/**
 * Constructs a {@link HttpHandler} that applies a bunch of {@link HttpInterceptor}s
 * to a request before passing it to the given {@link HttpBackend}.
 *
 * Meant to be used as a factory function within {@link HttpClientModule}.
 *
 * @experimental
 */
export function interceptingHandler(
    backend: HttpBackend, interceptors: HttpInterceptor[] | null = []): HttpHandler {
  if (!interceptors) {
    return backend;
  }
  return interceptors.reduceRight(
      (next, interceptor) => new HttpInterceptorHandler(next, interceptor), backend);
}

/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 * @experimental
 */
export function jsonpCallbackMap(): Object {
  let _global: {[key: string]: any};
  if (typeof window === 'object') {
    return window;
  }
  return {};
}

/**
 * {@link NgModule} which provides the {@link HttpClient} and associated services.
 *
 * Interceptors can be added to the chain behind {@link HttpClient} by binding them
 * to the multiprovider for {@link HTTP_INTERCEPTORS}.
 *
 * @experimental
 */
@NgModule({
  providers: [
    HttpClient,
    // HttpHandler is the backend + interceptors and is constructed
    // using the interceptingHandler factory function.
    {
      provide: HttpHandler,
      useFactory: interceptingHandler,
      deps: [HttpBackend, [new Optional(), new Inject(HTTP_INTERCEPTORS)]],
    },
    HttpXhrBackend,
    {provide: HttpBackend, useExisting: HttpXhrBackend},
    BrowserXhr,
    {provide: XhrFactory, useExisting: BrowserXhr},
  ],
})
export class HttpClientModule {
}

/**
 * {@link NgModule} which enables JSONP support in {@link HttpClient}.
 *
 * Without this module, {@link HttpClient#jsonp} requests will reach the backend
 * with method JSONP, where they'll be rejected.
 *
 * @experimental
 */
@NgModule({
  providers: [
    JsonpClientBackend,
    {provide: JsonpCallbackMap, useFactory: jsonpCallbackMap},
    {provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true},
  ],
})
export class HttpClientJsonpModule {
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ddescribe, describe, it} from '@angular/core/testing/src/testing_internal';

import {HttpHeaders} from '../src/headers';
import {HttpMethod, HttpRequest, HttpResponseType} from '../src/request';

const TEST_URL = 'http://angular.io';
const TEST_STRING = `I'm a body!`;

export function main() {
  describe('HttpRequest', () => {
    describe('constructor', () => {
      it('initializes url', () => {
        const req = new HttpRequest(TEST_URL, '', null);
        expect(req.url).toBe(TEST_URL);
      });
      it('doesn\'t require a body for body-less methods', () => {
        let req = new HttpRequest(TEST_URL, 'GET');
        expect(req.method).toBe('GET');
        expect(req.body).toBeNull();
        req = new HttpRequest(TEST_URL, 'HEAD');
        expect(req.method).toBe('HEAD');
        expect(req.body).toBeNull();
        req = new HttpRequest(TEST_URL, 'JSONP');
        expect(req.method).toBe('JSONP');
        expect(req.body).toBeNull();
        req = new HttpRequest(TEST_URL, 'OPTIONS');
        expect(req.method).toBe('OPTIONS');
        expect(req.body).toBeNull();
      });
      it('accepts a string request method', () => {
        const req = new HttpRequest(TEST_URL, 'TEST', null);
        expect(req.method).toBe('TEST');
      });
      it('accepts a string body', () => {
        const req = new HttpRequest(TEST_URL, 'POST', TEST_STRING);
        expect(req.body).toBe(TEST_STRING);
      });
      it('accepts an object body', () => {
        const req = new HttpRequest(TEST_URL, 'POST', {data: TEST_STRING});
        expect(req.body).toEqual({data: TEST_STRING});
      });
      it('creates default headers if not passed', () => {
        const req = new HttpRequest(TEST_URL, 'GET');
        expect(req.headers instanceof HttpHeaders).toBeTruthy();
      });
      it('uses the provided headers if passed', () => {
        const headers = new HttpHeaders();
        const req = new HttpRequest(TEST_URL, 'GET', {headers});
        expect(req.headers).toBe(headers);
      });
      it('defaults to Json', () => {
        const req = new HttpRequest(TEST_URL, 'GET');
        expect(req.responseType).toBe('json');
      });
    });
    describe('clone() copies the request', () => {
      const headers = new HttpHeaders({
        'Test': 'Test header',
      });
      const req = new HttpRequest(TEST_URL, 'POST', 'test body', {
        headers,
        reportProgress: true,
        responseType: 'text',
        withCredentials: true,
      });
      it('in the base case', () => {
        const clone = req.clone();
        expect(clone.method).toBe('POST');
        expect(clone.responseType).toBe('text');
        expect(clone.url).toBe(TEST_URL);
        // Headers should be the same, as the headers are sealed.
        expect(clone.headers).toBe(headers);
        expect(clone.headers.get('Test')).toBe('Test header');
      });
      it('and updates the url',
         () => { expect(req.clone({url: '/changed'}).url).toBe('/changed'); });
      it('and updates the method',
         () => { expect(req.clone({method: 'PUT'}).method).toBe('PUT'); });
      it('and updates the body',
         () => { expect(req.clone({body: 'changed body'}).body).toBe('changed body'); });
    });
    describe('content type detection', () => {
      const baseReq = new HttpRequest('/test', 'POST', null);
      it('handles a null body', () => { expect(baseReq.detectContentTypeHeader()).toBeNull(); });
      it('doesn\'t associate a content type with ArrayBuffers', () => {
        const req = baseReq.clone({body: new ArrayBuffer(4)});
        expect(req.detectContentTypeHeader()).toBeNull();
      });
      it('handles strings as text', () => {
        const req = baseReq.clone({body: 'hello world'});
        expect(req.detectContentTypeHeader()).toBe('text/plain');
      });
      it('handles arrays as json', () => {
        const req = baseReq.clone({body: ['a', 'b']});
        expect(req.detectContentTypeHeader()).toBe('application/json');
      });
      it('handles numbers as json', () => {
        const req = baseReq.clone({body: 314159});
        expect(req.detectContentTypeHeader()).toBe('application/json');
      });
      it('handles objects as json', () => {
        const req = baseReq.clone({body: {data: 'test data'}});
        expect(req.detectContentTypeHeader()).toBe('application/json');
      });
    });
    describe('body serialization', () => {
      const baseReq = new HttpRequest('/test/', 'POST', null);
      it('handles a null body', () => { expect(baseReq.serializeBody()).toBeNull(); });
      it('passes ArrayBuffers through', () => {
        const body = new ArrayBuffer(4);
        expect(baseReq.clone({body}).serializeBody()).toBe(body);
      });
      it('passes strings through', () => {
        const body = 'hello world';
        expect(baseReq.clone({body}).serializeBody()).toBe(body);
      });
      it('serializes arrays as json', () => {
        expect(baseReq.clone({body: ['a', 'b']}).serializeBody()).toBe('["a","b"]');
      });
      it('handles numbers as json',
         () => { expect(baseReq.clone({body: 314159}).serializeBody()).toBe('314159'); });
      it('handles objects as json', () => {
        const req = baseReq.clone({body: {data: 'test data'}});
        expect(req.serializeBody()).toBe('{"data":"test data"}');
      });
    });
  });
}
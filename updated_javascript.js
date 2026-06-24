'use strict';
var k = typeof Object.defineProperties == 'function' ?
    Object.defineProperty :
    function(a, b, c) {
      if (a == Array.prototype || a == Object.prototype) return a;
      a[b] = c.value;
      return a
    };
function l(a) {
  a = [
    'object' == typeof globalThis && globalThis, a,
    'object' == typeof window && window, 'object' == typeof self && self,
    'object' == typeof global && global
  ];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) return c
  }
  throw Error('Cannot find global object');
}
var m = l(this);
function n(a, b) {
  if (b)
    a: {
      var c = m; a = a.split('.'); for (var d = 0; d < a.length - 1; d++) {
        var g = a[d];
        if (!(g in c)) break a;
        c = c[g]
      } a = a[a.length - 1];
      d = c[a];
      b = b(d);
      b != d && b != null && k(c, a, {configurable: !0, writable: !0, value: b})
    }
}
function p(a) {
  return q(a, a)
}
function q(a, b) {
  a.raw = b;
  Object.freeze && (Object.freeze(a), Object.freeze(b));
  return a
}
function r() {
  for (var a = Number(this), b = [], c = a; c < arguments.length; c++)
    b[c - a] = arguments[c];
  return b
}
n('globalThis', function(a) {
  return a || m
});
/*

 Copyright Google LLC
 SPDX-License-Identifier: Apache-2.0
*/
var t = globalThis.trustedTypes, u;
function v() {
  var a = null;
  if (!t) return a;
  try {
    var b = function(c) {
      return c
    };
    a = t.createPolicy(
        'goog#html', {createHTML: b, createScript: b, createScriptURL: b})
  } catch (c) {
  }
  return a
};
function w(a) {
  this.g = a
}
w.prototype.toString = function() {
  return this.g + ''
};
function x(a) {
  var b;
  u === void 0 && (u = v());
  a = (b = u) ? b.createScriptURL(a) : a;
  return new w(a)
};
function y(a, b) {
  if (b instanceof w)
    b = b.g;
  else
    throw Error('');
  a.src = b;
  var c;
  b = a.ownerDocument;
  b = b === void 0 ? document : b;
  var d;
  b = (d = (c = b).querySelector) == null ? void 0 : d.call(c, 'script[nonce]');
  (c = b == null ? '' : b.nonce || b.getAttribute('nonce') || '') &&
      a.setAttribute('nonce', c)
};
function z(a) {
  var b = r.apply(1, arguments);
  if (b.length === 0) return x(a[0]);
  for (var c = a[0], d = 0; d < b.length; d++)
    c += encodeURIComponent(b[d]) + a[d + 1];
  return x(c)
};
var A = p(['https://www.gstatic.com/gecx/chat-widget/chat-widget.js']);
(function() {
function a() {
  customElements.whenDefined('gecx-chat-widget').then(function() {
    if (!document.querySelector('gecx-chat-widget')) {
      var f = document.createElement('gecx-chat-widget');
      b && f.setAttribute('agent-name', b);
      c && f.setAttribute('endpoint-config', c);
      d && f.setAttribute('token-broker', d);
      f.setAttribute('client-id', 'gecx-user');
      document.body ? document.body.appendChild(f) :
                      window.addEventListener('DOMContentLoaded', function() {
                        document.body.appendChild(f)
                      })
    }
  })
}
var b = window.cesAgentName, c = window.cesEndpointConfig,
    d = window.cesTokenBroker;
if (window.customElements && customElements.get('gecx-chat-widget'))
  a();
else {
  var g = z(A),
      e = document.querySelector('script[src="' + g.toString() + '"]'), h = e;
  e ||
      (e = document.createElement('script'), y(e, g), e.defer = !0,
       document.head.appendChild(e), h = e);
  h && (h.addEventListener('load', a), h.addEventListener('error', function() {
    console.error('GECX Loader Error: Failed to load chat-widget.js')
  }))
}
})();

var UdanLibrary;
/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./src/InjectHeaders.js ***!
  \******************************/
var _chrome;
var s = document.createElement('script');
var scriptpath = (_chrome = chrome) === null || _chrome === void 0 || (_chrome = _chrome.runtime) === null || _chrome === void 0 ? void 0 : _chrome.getURL("assets/UDAHeaders.js");
s.src = scriptpath;
s.onload = function () {};
(document.head || document.documentElement).appendChild(s);
UdanLibrary = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=UDAInjectHeaders.js.map
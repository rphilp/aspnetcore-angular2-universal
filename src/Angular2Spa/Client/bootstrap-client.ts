// import 'angular2-universal-polyfills/browser'; // This needs to be at the top, Universal neccessary polyfills
import 'zone.js/dist/zone';

// polyfills
// import 'es6-promise';
// import 'es6-shim';
// import 'ie-shim';
// typescript emit metadata
import 'reflect-metadata';
// zone.js to track promises
import 'zone.js/dist/zone';

import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// HMR state management 
import { handleHmr } from 'app';
// Grab the browser-specific NgModule
import { AppBrowserModule } from './app/platform-modules/app.browser.module';

let platform;

if (process.env.production) {
  enableProdMode();
  platform = platformBrowser();
} else {
  // Development mode
  platform = platformBrowserDynamic();
}

// Boot the application normally
const bootApplication = () => platform.bootstrapModule(AppBrowserModule);

// HMR bootstrap overload
const hmrBootstrap = () => { handleHmr(module, bootApplication); };

if ((<any>module).hot && process.env.development) {
    hmrBootstrap();
} else {
    bootApplication();
}


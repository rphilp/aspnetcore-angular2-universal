// import 'angular2-universal-polyfills/node';
// import 'zone.js';
// polyfills
// import 'es6-promise';
// import 'es6-shim';
// typescript emit metadata
import 'reflect-metadata';
import 'zone.js/dist/zone-node';


import { enableProdMode } from '@angular/core'; 

import { NgModule, NgZone, NgModuleRef, ApplicationRef, Renderer } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { platformDynamicServer, PlatformState, INITIAL_CONFIG  } from '@angular/platform-server';

import { createServerRenderer, RenderResult } from 'aspnet-prerendering';

// Grab the (Node) server-specific NgModule
import { AppServerModule } from './app/platform-modules/app.server.module';
import { metaStore } from 'app-shared';
import { CacheService } from 'app-shared';

enableProdMode();

export default createServerRenderer(params => {

    // Our Root application document
    const doc = '<app-root></app-root>';

    const platform = platformDynamicServer([{
        provide: INITIAL_CONFIG, useValue: {
            document: doc,
            url: params.url
        }}
    ]);

    return new Promise<RenderResult>((resolve, reject) => {
        platform.bootstrapModule(AppServerModule).then((moduleRef: NgModuleRef<{}>) => {
            const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
            return appRef.isStable
                .filter((isStable: boolean) => isStable)
                .first()
                .toPromise();
        }).then(stable => {
            const state: PlatformState = platform.injector.get(PlatformState);
            // const renderer: Renderer = platform.injector.get(Renderer);

            // const DOC = state.getDocument();
            // const Head = DOC.getElementsByTagName(state, 'head');;

            // console.log('\n\n --- Renderer ---\n');
            // let input = renderer.createElement(state, 'script');
            // renderer.setText(input, metaStore.getState().toString());

            // console.log(input);

            resolve({ 
                html: state.renderToString(), 
                globals: metaStore
            });

            platform.destroy();
        }).catch(err => {
            return resolve(err)
        });
    });
});

    // const platform = platformDynamicServer([
    // {
    //     provide: INITIAL_CONFIG, useValue: {
    //         document: doc,
    //         url: params.url
    //     }}
    // ]);

    // return new Promise<RenderResult>((resolve, reject) => {

    //     return platform.bootstrapModule(AppServerModule).then(moduleRef => {

    //         const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

    //         return appRef.isStable
    //         .filter((isStable: boolean) => isStable)
    //         .first()
    //         .toPromise();
            // .subscribe((stable) => {

            //     // injectCache(moduleRef);

            //     resolve({ 
            //         html: state.renderToString(), 
            //         globals: metaStore 
            //     });

            //     platform.destroy();
            // });

            
        // }).then(stable => {

        //     const state: PlatformState = platform.injector.get(PlatformState);

        //     resolve({ 
        //         html: state.renderToString(), 
        //         globals: metaStore 
        //     });

        //     platform.destroy();
            
        // }).catch(err => {
        //     console.log('--- ERROR HAPPENED !! ---');

        //     reject(err);
        //     console.log('\n\n');
        // });

        // const requestZone = Zone.current.fork({
        //     name: 'Angular-Universal Request',
        //     onHandleError: (parentZone, currentZone, targetZone, error) => {
        //         // If any error occurs while rendering the module, reject the whole operation
        //         reject(error);
        //         return true;
        //     }
        // });

        // return platform.bootstrapModule(AppServerModule).then(moduleRef => {
        //     const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

        //     return appRef.isStable.filter(isStable => isStable).first().toPromise();
        // }).then(stable => {

        //     const state: PlatformState = platform.injector.get(PlatformState);

        //     resolve({ 
        //         html: state.renderToString(), 
        //         globals: metaStore 
        //     });

        //     platform.destroy();
        //     return true;

        // }).catch(err => reject(err));

        // return requestZone.run<Promise<NgModuleRef<{}>>>(() => platform.bootstrapModule(AppServerModule)).then(moduleRef => {

        //     const state: PlatformState = moduleRef.injector.get(PlatformState);
        //     const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

        //     appRef.isStable
        //     .filter((isStable: boolean) => isStable)
        //     .first()
        //     .subscribe((stable) => {

        //         // injectCache(moduleRef);

        //         resolve({ 
        //             html: state.renderToString(), 
        //             globals: metaStore 
        //         });

        //         platform.destroy();
        //     });

            
        // }, reject);

// });



        // platform.bootstrapModule(AppServerModule).then(moduleRef => {
        //     const state = moduleRef.injector.get(PlatformState);
        //     const appRef = moduleRef.injector.get(ApplicationRef);

        //     appRef.isStable.filter((isStable: boolean) => isStable)
        //     .first()
        //     .subscribe((stable) => {

        //         injectCache(moduleRef);
                
        //         // callback(null, state.renderToString());
        //         platform.destroy();
        //     });

        // });


    // return new Promise<RenderResult>((resolve, reject) => {
    //     const requestZone = Zone.current.fork({
    //         name: 'Angular-Universal Request',
    //         properties: {
    //             ngModule: AppServerModule,
    //             baseUrl: '/',
    //             requestUrl: params.url,
    //             originUrl: params.origin,
    //             preboot: false,
    //             document: doc
    //         },
    //         onHandleError: (parentZone, currentZone, targetZone, error) => {
    //             // If any error occurs while rendering the module, reject the whole operation
    //             reject(error);
    //             return true;
    //         }
    //     });

    //     return requestZone.run<Promise<string>>(() => platform.serializeModule(AppServerModule)).then(html => {
    //         resolve({ html: html, globals: metaStore });
    //     }, reject);
    // });


// function injectCache(moduleRef: NgModuleRef<{}>) {
//   try {
//     const cache = moduleRef.injector.get(CacheService);
//     const state = moduleRef.injector.get(PlatformState);
//     const document: any = state.getDocument();
//     const dom = getDOM();
//     const script: HTMLScriptElement = <HTMLScriptElement> dom.createElement('script');
//     const cacheString = JSON.stringify(cache.toJSON());
//     dom.setText(script, `window['UNIVERSAL_CACHE'] = ${cacheString}`);
//     const body = dom.querySelector(document, 'body');
//     dom.appendChild(body, script);
//   } catch (e) {
//     console.error(e);
//   }
// }




// export default function (params: IParams): Promise<{ html: string, globals?: any }> {

//     // Our Root application document
//     const doc = '<app-root></app-root>';

//     // hold platform reference
//     const platformRef = platformNodeDynamic();

//     let platformConfig = {
//         ngModule: AppServerModule,
//         document: doc,
//         preboot: false,
//         baseUrl: '/',
//         requestUrl: params.url,
//         originUrl: params.origin
//     };

//     // defaults
//     let cancel = false;

//     const _config = Object.assign({
//         get cancel() { return cancel; },
//         cancelHandler() { return Zone.current.get('cancel'); }
//     }, platformConfig);

//     // for each user
//     const zone = Zone.current.fork({
//         name: 'UNIVERSAL request',
//         properties: _config
//     });


//     return Promise.resolve(
//         zone.run(() => {
//             return platformRef.serializeModule(Zone.current.get('ngModule'));
//         })
//     ).then(html => {

//         // Something went wrong, return the original blank document at least
//         if (typeof html !== 'string') {
//             return { html: doc };
//         }

//         /*  Successfully serialized Application
//          *  You can pass "Globals" here if you want to pass some data to every request
//          *  (also you could pass in params.data if you want to pass data from the server that came through the Views/Index.cshtml page
//          *   inside of the asp-prerender-data="" attribute
//          *      globals: params.data
//          */
//         return { html, globals: metaStore };

//     }).catch(err => {

//         console.log(err);
//         return { html: doc };

//     });

// }

// export interface IParams {
//     origin: string;
//     url: string;
//     absoluteUrl: string;
//     data: {}; // custom user data sent from server (through asp-prerender-data="" attribute on index.cshtml)
// }

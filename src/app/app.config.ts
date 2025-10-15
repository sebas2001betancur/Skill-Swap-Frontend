import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

// ...
import { JwtInterceptor } from './interceptors/jwt.interceptor'; // <-- IMPORTA
import { routes } from './app.routes';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // ← CRÍTICO: Debe estar aquí
    provideHttpClient(withInterceptorsFromDi(), ), // <-- ASEGÚRATE DE USAR withInterceptorsFromDi()

    // Provide DOCUMENT for browser context
    {
      provide: DOCUMENT,
      useFactory: () => {
        if (typeof document !== 'undefined') {
          return document;
        }
        // Fallback for server-side or other contexts
        return { };
      }
    },

    // ...
    // --- Añadir el proveedor para el interceptor ---
        // --- ¿ESTA LÍNEA ESTÁ EXACTAMENTE ASÍ? ---
    importProvidersFrom(ReactiveFormsModule), // <-- 2. ¿Está aquí?
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ]
};
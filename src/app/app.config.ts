import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';



// ...
import { JwtInterceptor } from './interceptors/jwt.interceptor'; // <-- IMPORTA
import { routes } from './app.routes';
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // <-- ASEGÚRATE DE USAR withInterceptorsFromDi()
    // ...
    // --- Añadir el proveedor para el interceptor ---
        // --- ¿ESTA LÍNEA ESTÁ EXACTAMENTE ASÍ? ---
    importProvidersFrom(ReactiveFormsModule), // <-- 2. ¿Está aquí?
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ]
};
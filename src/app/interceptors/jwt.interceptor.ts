import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    console.log('Interceptor: Token encontrado:', token ? 'Sí' : 'No'); // <-- LÍNEA DE DEPURACIÓN

    if (token) {
      // Clona la petición y añade la cabecera de autorización.
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Interceptor: Cabecera Authorization añadida.'); // <-- LÍNEA DE DEPURACIÓN
    }

    return next.handle(request);
  }
}
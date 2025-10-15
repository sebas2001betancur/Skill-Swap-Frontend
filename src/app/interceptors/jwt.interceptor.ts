import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);


  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    console.log('Interceptor: Token encontrado:', token ? 'Sí' : 'No');
    console.log('Interceptor: URL de la petición:', request.url);

    if (token) {
      // Clona la petición y añade la cabecera de autorización.
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Interceptor: Cabecera Authorization añadida.');
    } else {
      console.log('Interceptor: No hay token, petición sin autenticación.');
    }

    return next.handle(request);
  }
}
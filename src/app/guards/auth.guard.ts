// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia de ruta funcional para proteger rutas que requieren autenticación.
 * CanActivateFn: Define la firma de un guardia que determina si una ruta puede ser activada.
 */
export const authGuard: CanActivateFn = (route, state) => {
  
  // Usamos inject() para obtener instancias de nuestros servicios.
  // Es el equivalente moderno a la inyección por constructor.
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si el usuario está logueado usando nuestro AuthService.
  if (authService.isLoggedIn()) {
    // Si el token existe y es válido (según la lógica de isLoggedIn),
    // el usuario tiene permiso para acceder a la ruta.
    return true; 
  }

  // Si el usuario NO está logueado, le impedimos el acceso
  // y lo redirigimos a la página de login.
  // router.parseUrl('/login') es la forma moderna de devolver una redirección desde un guardia.
  return router.parseUrl('/login');
};
// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
 import { BehaviorSubject, Observable, of, tap, throwError, catchError } from 'rxjs';
import { UserDto, AuthResponseDto } from '../models/auth'; // Asegúrate de que estas interfaces existan
// import { jwtDecode } from 'jwt-decode'; // Opcional: si usas jwt-decode
import { environment } from '../../environments/environment';

import { isPlatformBrowser } from '@angular/common';

// Definir la estructura del token decodificado si no usas jwt-decode o para tipado
interface DecodedToken {
  [key: string]: unknown;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  rol?: string;
  nameid?: string;
  sub?: string;
  id?: string;
  userId?: string;
  user_id?: string;
  name?: string;
  given_name?: string;
  email?: string;
  mail?: string;
  email_address?: string;
  e_mail?: string;
}

export interface AuthState {
  isLoading: boolean;
  user: UserDto | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly tokenKey = 'skillswap_token';
  private readonly apiUrl = `${environment.apiUrl}/api/Auth`; // Ajusta según tu estructura
  private isBrowser: boolean;

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    console.log('AuthService: Inicializando estado de autenticación...');
    if (this.isBrowser) {
      const token = this.getTokenFromStorage();
      if (token) {
        try {
          // Intenta parsear el token manualmente o usa jwt-decode
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = atob(payloadBase64); // atob decodifica base64
          const decodedToken: DecodedToken = JSON.parse(decodedPayload);

          console.log('AuthService: Token decodificado:', decodedToken);

           // Crear usuario base desde token, forzando rol 'Usuario' para evitar conversión automática
           const baseUser: UserDto = {
             id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                 decodedToken.nameid ||
                 decodedToken.sub ||
                 decodedToken.id ||
                 decodedToken.userId ||
                 decodedToken.user_id ||
                 '',
             nombre: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                     decodedToken.name ||
                     decodedToken.given_name ||
                     'Usuario',
             email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                    decodedToken.email ||
                    decodedToken.mail ||
                    decodedToken.email_address ||
                    decodedToken.e_mail ||
                    '',
             rol: 'Usuario' // Forzar 'Usuario' para nuevos usuarios, evitar automático
           };

          // Intentar cargar usuario actualizado desde localStorage
          const savedUser = this.getSavedUserFromStorage();
          console.log('AuthService: Usuario guardado en localStorage:', savedUser);
          console.log('AuthService: Usuario base del token:', baseUser);

           // Usar datos de localStorage solo si el ID coincide exactamente
           const user = (savedUser && savedUser.id === baseUser.id) ? { ...baseUser, ...savedUser } : baseUser;

           // Si savedUser existe pero ID no coincide, limpiar localStorage para evitar conflictos
           if (savedUser && savedUser.id !== baseUser.id) {
             console.log('AuthService: ID no coincide, limpiando localStorage de usuario anterior');
             this.clearSavedUserFromStorage();
           }

          console.log('AuthService: Usuario final después de merge:', user);
          console.log('AuthService: ¿Es mentor?', user.esMentor, 'Materias:', user.materiasQueDomina || user.materias, 'Biografía:', user.biografia);
          this.setAuthState(false, user, true);
        } catch (error) {
          console.error('AuthService: Error al decodificar el token:', error);
          this.clearTokenFromStorage();
          this.clearSavedUserFromStorage();
          this.setAuthState(false, null, false);
        }
      } else {
        console.log('AuthService: No se encontró token en localStorage.');
        this.setAuthState(false, null, false);
      }
    } else {
      console.log('AuthService: No es navegador (SSR).');
      this.setAuthState(false, null, false);
    }
  }

  private setAuthState(isLoading: boolean, user: UserDto | null, isAuthenticated: boolean): void {
    console.log(`AuthService: Actualizando estado - isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, user: ${user?.nombre}`);
    const newState: AuthState = {
      isLoading,
      user,
      isAuthenticated
    };
    this.authStateSubject.next(newState);
  }

  // --- Métodos de utilidad para token ---

  private getTokenFromStorage(): string | null {
    if (this.isBrowser) {
      try {
        return localStorage.getItem(this.tokenKey);
      } catch (e) {
        console.error('AuthService: Error accediendo a localStorage:', e);
        return null;
      }
    }
    return null;
  }

  private saveTokenToStorage(token: string): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.tokenKey, token);
        console.log('AuthService: Token guardado en localStorage.');
      } catch (e) {
        console.error('AuthService: Error guardando token en localStorage:', e);
      }
    }
  }

  private clearTokenFromStorage(): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(this.tokenKey);
        console.log('AuthService: Token eliminado de localStorage.');
      } catch (e) {
        console.error('AuthService: Error eliminando token de localStorage:', e);
      }
    }
  }

  private getSavedUserFromStorage(): UserDto | null {
    if (this.isBrowser) {
      try {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        console.error('AuthService: Error cargando usuario de localStorage:', e);
        return null;
      }
    }
    return null;
  }

  private saveUserToStorage(user: UserDto): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('AuthService: Usuario guardado en localStorage.');
      } catch (e) {
        console.error('AuthService: Error guardando usuario en localStorage:', e);
      }
    }
  }

  private clearSavedUserFromStorage(): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem('currentUser');
        console.log('AuthService: Usuario eliminado de localStorage.');
      } catch (e) {
        console.error('AuthService: Error eliminando usuario de localStorage:', e);
      }
    }
  }


  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  isLoading(): boolean {
    return this.authStateSubject.value.isLoading;
  }

  isLoggedIn(): boolean {
    const token = this.getTokenFromStorage();
    const isAuthenticated = this.authStateSubject.value.isAuthenticated;
    const result = !!token && isAuthenticated;
    console.log(`AuthService.isLoggedIn: ${result} (token: ${!!token}, isAuthenticated: ${isAuthenticated})`);
    return result;
  }

  getToken(): string | null {
    return this.getTokenFromStorage();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponseDto> {
    console.log('AuthService.login: Iniciando...');
    this.setAuthState(true, null, false);

    const loginUrl = `${this.apiUrl}/login`; // Ajusta la URL
    console.log(`AuthService.login: Enviando solicitud a ${loginUrl}`, credentials);

    return this.http.post<AuthResponseDto>(loginUrl, credentials).pipe(
      tap({
        next: (response: AuthResponseDto) => {
          console.log('AuthService.login: Éxito', response);
          this.setSession(response); // <-- Llama a setSession aquí
        },
        error: (error: HttpErrorResponse) => { // <-- Tipado explícito
          console.error('AuthService.login: Error', error);
          this.setAuthState(false, null, false);
        }
      })
    );
  }

  register(userData: { nombre: string; email: string; password: string }): Observable<AuthResponseDto> {
    console.log('AuthService.register: Iniciando...');
    this.setAuthState(true, null, false);

    const registerUrl = `${this.apiUrl}/register`; // Ajusta la URL
    console.log(`AuthService.register: Enviando solicitud a ${registerUrl}`, userData);

    return this.http.post<AuthResponseDto>(registerUrl, userData).pipe(
      tap({
        next: (response: AuthResponseDto) => { // <-- Tipado explícito
          console.log('AuthService.register: Éxito', response);
          this.setSession(response); // <-- Llama a setSession aquí también
        },
        error: (error: HttpErrorResponse) => { // <-- Tipado explícito
          console.error('AuthService.register: Error', error);
          this.setAuthState(false, null, false);
        }
      })
    );
  }
  
  

  /**
   * Maneja la lógica de establecer una sesión después de login/registro exitoso.
   * @param response La respuesta del backend que contiene el token y el UserDto.
   */
  private setSession(response: AuthResponseDto): void {
    console.log('AuthService.setSession: Estableciendo sesión...', response);
    if (response && response.token) {
      this.saveTokenToStorage(response.token);

       // Verificar si ya tenemos información guardada en localStorage
       const savedUser = this.getSavedUserFromStorage();
       console.log('AuthService.setSession: Usuario guardado en localStorage:', savedUser);

       // Usar información de localStorage si existe (más completa), pero solo si el ID coincide
       const userToUse = (savedUser && savedUser.id === response.user.id) ? { ...response.user, ...savedUser } : response.user;

       // Limpiar si ID no coincide
       if (savedUser && savedUser.id !== response.user.id) {
         this.clearSavedUserFromStorage();
       }
      console.log('AuthService.setSession: Usuario a usar:', userToUse);

      this.setAuthState(false, userToUse, true);

      // Intentar cargar perfil completo desde backend para actualizar información
      this.loadUserProfile().subscribe({
        next: (fullUser) => {
          console.log('AuthService.setSession: Perfil completo cargado desde backend:', fullUser);
          // El updateCurrentUser ya guarda en localStorage
        },
        error: (err) => {
          console.log('AuthService.setSession: No se pudo cargar perfil completo desde backend:', err);
          // Mantener la información que ya tenemos
        }
      });

      console.log('AuthService.setSession: Sesión establecida.');
    } else {
      console.error('AuthService.setSession: Respuesta inválida, no contiene token.', response);
      this.logout(); // Cierra sesión si la respuesta es inválida
    }
  }

  logout(): void {
    console.log('AuthService.logout: Cerrando sesión...');

    // DEBUG: Verificar qué hay en localStorage antes del logout
    if (this.isBrowser) {
      const savedUser = this.getSavedUserFromStorage();
      console.log('AuthService.logout: Usuario en localStorage ANTES del logout:', savedUser);
    }

     this.clearTokenFromStorage();
     // NO eliminamos los datos del usuario para mantener la configuración del perfil
     // this.clearSavedUserFromStorage(); // Comentado para mantener persistencia
    this.setAuthState(false, null, false);

    // DEBUG: Verificar qué queda en localStorage después del logout
    if (this.isBrowser) {
      const savedUserAfter = this.getSavedUserFromStorage();
      console.log('AuthService.logout: Usuario en localStorage DESPUÉS del logout:', savedUserAfter);
    }

    console.log('AuthService.logout: Sesión cerrada.');
    // Considera redirigir al usuario a la página de login aquí si es necesario
    // this.router.navigate(['/login']); // Necesitarías inyectar Router
  }

  /**
   * Actualiza el estado del usuario en el servicio y en el almacenamiento local.
   * @param user El nuevo objeto UserDto.
   */
  updateUserState(user: UserDto): void {
    console.log('AuthService.updateUserState: Actualizando estado del usuario...', user);
    const currentState = this.authStateSubject.value;
    // Opcional: guardar en localStorage si es necesario para persistencia fuera del observable
    // localStorage.setItem('user', JSON.stringify(user));
    this.authStateSubject.next({
      ...currentState,
      user
    });
    console.log('AuthService.updateUserState: Estado del usuario actualizado.');
  }

  /**
   * Refresca los datos del usuario actual desde el backend.
   * @returns Un Observable del UserDto actualizado.
   */
  

// src/app/services/auth.service.ts - Agregar métodos
// src/app/services/auth.service.ts
updateCurrentUser(user: UserDto): void {
  console.log('🔄 Actualizando usuario en AuthService:', user);
  console.log('🔄 Datos del usuario - esMentor:', user.esMentor, 'rol:', user.rol, 'materias:', user.materiasQueDomina || user.materias, 'biografia:', user.biografia);

  // Asegurar que esMentor esté correctamente calculado y rol sea consistente
  const updatedUser = {
    ...user,
    esMentor: user.esMentor || user.rol === 'Mentor' || user.rol === 'Admin',
    rol: user.esMentor || user.rol === 'Mentor' || user.rol === 'Admin' ? 'Mentor' : user.rol
  };

  console.log('✅ Usuario actualizado:', updatedUser);
  console.log('✅ Usuario actualizado - esMentor:', updatedUser.esMentor, 'materias:', updatedUser.materiasQueDomina || updatedUser.materias, 'biografia:', updatedUser.biografia);

  const currentState = this.authStateSubject.value;
  if (currentState) {
    this.authStateSubject.next({
      ...currentState,
      user: updatedUser
    });
    // Guardar en localStorage usando el método consistente
    this.saveUserToStorage(updatedUser);
    console.log('💾 Usuario guardado en localStorage desde updateCurrentUser');
  }
}

getCurrentUser(): UserDto | null {
  return this.authStateSubject.value?.user || null;
}

  refreshCurrentUser(): Observable<UserDto> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No hay token de autenticación'));
    }

    // Hacer llamada al backend para obtener perfil actualizado
    const profileUrl = `${environment.apiUrl}/api/auth/profile`; // Cambiado a minúsculas
    return this.http.get<UserDto>(profileUrl).pipe(
      tap({
        next: (user) => {
          console.log('AuthService.refreshCurrentUser: Usuario actualizado desde backend:', user);
          this.updateCurrentUser(user);
        },
        error: (error) => {
          // No loggear error para 404, ya que puede que el endpoint no exista
          if (error.status !== 404) {
            console.error('AuthService.refreshCurrentUser: Error obteniendo perfil:', error);
          }
        }
      })
    );
  }

  loadUserProfile(): Observable<UserDto> {
    const profileUrl = `${environment.apiUrl}/api/auth/profile`; // Cambiado a minúsculas
    return this.http.get<UserDto>(profileUrl).pipe(
      tap({
        next: (user) => {
          console.log('AuthService.loadUserProfile: Perfil cargado desde backend:', user);
          this.updateCurrentUser(user);
        },
        error: (error) => {
          // No loggear error para 404
          if (error.status !== 404) {
            console.error('AuthService.loadUserProfile: Error cargando perfil:', error);
          }
          // No hacer logout, solo usar datos locales
        }
      })
    );
  }

 isMentorProfileComplete(): boolean {
   const user = this.getCurrentUser();
   if (!user || !user.esMentor) return false;

   // Verificar que tenga biografía y al menos una materia
   return !!(user.biografia && user.materiasQueDomina && user.materiasQueDomina.length > 0);
 }

 /**
  * Fuerza la actualización completa del estado del usuario desde el backend
  * Útil cuando el token podría estar desactualizado
  */
 forceUserRefresh(): Observable<UserDto> {
   console.log('🔄 Forzando refresh completo del usuario...');

   // Limpiar el estado actual
   this.setAuthState(false, null, false);

   // Obtener token actual
   const token = this.getToken();
   if (!token) {
     return throwError(() => new Error('No hay token de autenticación'));
   }

   // Hacer llamada al backend para obtener perfil actualizado
   const profileUrl = `${environment.apiUrl}/api/Auth/profile`;
   return this.http.get<UserDto>(profileUrl).pipe(
     tap({
       next: (user) => {
         console.log('✅ Usuario refrescado completamente desde backend:', user);
         this.updateCurrentUser(user);

         // Verificar consistencia del rol
         if (user.rol === 'Mentor' && !user.esMentor) {
           console.warn('⚠️ Inconsistencia detectada: rol=Mentor pero esMentor=false');
         }
       },
       error: (error) => {
         console.error('❌ Error al forzar refresh del usuario:', error);
         throw error;
       }
     })
   );
 }

 /**
  * Método para verificar si el usuario necesita refresh
  */
 needsRefresh(): boolean {
   const user = this.getCurrentUser();
   if (!user) return false;

   // Si es mentor pero no tiene materias, probablemente necesita refresh
    return user.esMentor === true && (!user.materiasQueDomina || user.materiasQueDomina.length === 0);
 }

 /**
  * Intenta actualizar el usuario, y si falla, fuerza logout y muestra mensaje
  */
 ensureUserIsUpdated(): Observable<UserDto | null> {
   console.log('🔄 Asegurando que el usuario esté actualizado...');

   if (this.needsRefresh()) {
     console.log('⚠️ Usuario necesita refresh, intentando...');

      return this.forceUserRefresh().pipe(
        catchError((error) => {
          console.error('❌ Error al refrescar usuario:', error);
          // No forzar logout, usar datos locales
          return of(this.getCurrentUser());
        })
     );
   } else {
     console.log('✅ Usuario está actualizado');
     return of(this.getCurrentUser());
   }
 }

 /**
  * Función de utilidad para verificar y actualizar usuario en cualquier componente
  */
 checkAndUpdateUser(): void {
   console.log('🔍 Verificando estado del usuario...');

   this.ensureUserIsUpdated().subscribe({
     next: (user) => {
       if (user) {
         console.log('✅ Usuario verificado y actualizado:', user);
       }
     },
     error: (err) => {
       console.error('❌ Error al verificar usuario:', err);
     }
   });
 }

}
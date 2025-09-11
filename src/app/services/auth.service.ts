import { Inject, Injectable, PLATFORM_ID } from '@angular/core'; // <-- Importar
import { isPlatformBrowser } from '@angular/common'; // <-- Importar
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDto, AuthResponseDto } from '../models/auth';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/Auth`;
  private readonly tokenKey = 'skillswap_token';
  

  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Esta variable nos dirá si estamos en el navegador o en el servidor.
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    // Inyectamos PLATFORM_ID para poder diferenciar el entorno.
    @Inject(PLATFORM_ID) private platformId: Object 
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadInitialUser();
  }



  // src/app/services/auth.service.ts
// ...
// ¿Es exactamente este el nombre de la clave?




  public isLoggedIn(): boolean {
    return !!this.getToken();
  }


  
 
  

  


  public get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value;
  }

  
   public register(payload: any): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => this.setSession(response))
    );
  }

  public login(payload: any): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, payload).pipe(
      tap(response => this.setSession(response))
    );
  }

  public logout(): void {
    // 4. Protege todas las interacciones con localStorage
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
  }

  public getToken(): string | null {
    // 4. Protege todas las interacciones con localStorage
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setSession(authResponse: AuthResponseDto): void {
    if (authResponse && authResponse.token && this.isBrowser) {
      // 4. Protege todas las interacciones con localStorage
      localStorage.setItem(this.tokenKey, authResponse.token);
      this.currentUserSubject.next(authResponse.user);
    }
  }

  private loadInitialUser(): void {
    // Este método ahora solo se llama desde el constructor si estamos en el navegador,
    // por lo que no necesita una comprobación interna adicional.
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const tokenExpired = decodedToken.exp * 1000 < Date.now();
        if (tokenExpired) {
          this.logout();
          return;
        }
        const user: UserDto = {
          id: decodedToken.nameid,
          nombre: decodedToken.name,
          email: decodedToken.email
        };
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }


}
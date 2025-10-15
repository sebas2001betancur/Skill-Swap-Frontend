import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Intercambio } from '../models/Intercambio';


@Injectable({
  providedIn: 'root'
})
export class IntercambioService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/api/Intercambios`;

  createPropuesta(cursoSolicitadoId: string, cursoOfrecidoId: string): Observable<Intercambio> {
    const payload = { cursoSolicitadoId, cursoOfrecidoId };
    return this.http.post<Intercambio>(this.apiUrl, payload);
  }

  getPropuestasRecibidas(): Observable<Intercambio[]> {
    return this.http.get<Intercambio[]>(`${this.apiUrl}/recibidos`);
  }

  getPropuestasEnviadas(): Observable<Intercambio[]> {
    return this.http.get<Intercambio[]>(`${this.apiUrl}/enviados`);
  }

  aceptarPropuesta(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/aceptar`, {});
  }

  rechazarPropuesta(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/rechazar`, {});
  }
}
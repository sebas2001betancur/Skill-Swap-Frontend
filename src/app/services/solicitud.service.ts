// src/app/services/solicitud.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SolicitudTutoria } from '../models/tutoria';

export interface RechazarSolicitudRequest {
  razonRechazo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = environment.apiUrl + '/api/Solicitudes';
  private readonly http = inject(HttpClient);

  /**
   * HU06: Obtener solicitudes ENVIADAS por mí (como estudiante)
   * Estas son las solicitudes que YO envié para participar en tutorías de otros mentores
   */
  getMisSolicitudesEnviadas(): Observable<SolicitudTutoria[]> {
    console.log('📤 Obteniendo mis solicitudes enviadas');
    return this.http.get<SolicitudTutoria[]>(`${this.apiUrl}/enviadas`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * HU07: Obtener solicitudes RECIBIDAS (como mentor)
   * Estas son las solicitudes que estudiantes enviaron para MIS tutorías
   */
  getMisSolicitudesRecibidas(): Observable<SolicitudTutoria[]> {
    console.log('📥 Obteniendo mis solicitudes recibidas (como mentor)');
    return this.http.get<SolicitudTutoria[]>(`${this.apiUrl}/recibidas`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * HU07: Aceptar una solicitud recibida (solo mentor)
   */
  aceptarSolicitud(solicitudId: string): Observable<SolicitudTutoria> {
    console.log('✅ Aceptando solicitud:', solicitudId);
    return this.http.post<SolicitudTutoria>(`${this.apiUrl}/${solicitudId}/aceptar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * HU07: Rechazar una solicitud recibida (solo mentor)
   */
  rechazarSolicitud(solicitudId: string, request: RechazarSolicitudRequest): Observable<SolicitudTutoria> {
    console.log('🚫 Rechazando solicitud:', solicitudId, 'Razón:', request.razonRechazo);
    return this.http.post<SolicitudTutoria>(`${this.apiUrl}/${solicitudId}/rechazar`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener solicitudes de una tutoría específica (para el mentor dueño)
   */
  getSolicitudesPorTutoria(tutoriaId: string): Observable<SolicitudTutoria[]> {
    console.log('📋 Obteniendo solicitudes de tutoría:', tutoriaId);
    return this.http.get<SolicitudTutoria[]>(`${this.apiUrl}/tutoria/${tutoriaId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ Error en SolicitudService:', error);
    
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 400) {
        errorMessage = 'Solicitud inválida';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para esta acción';
      } else if (error.status === 404) {
        errorMessage = 'Solicitud no encontrada';
      } else if (error.status === 409) {
        errorMessage = 'La solicitud ya fue procesada';
      } else {
        errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }
    
    return throwError(() => ({ ...error, message: errorMessage }));
  }
}
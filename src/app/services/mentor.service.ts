// src/app/services/mentor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActivarMentorDto {
  biografia?: string;
  semestre?: number;
  MateriasQueDomine: string[]; // PascalCase para coincidir con backend
}

export interface ActivarMentorResponse {
  message: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    esMentor: boolean;
    biografia?: string;
    semestre?: number;
    calificacionPromedio: number;
    totalTutoriasDadas: number;
    materiasQueDomina: string[];
  };
}

export interface PerfilPublicoMentor {
  id: string;
  nombre: string;
  email: string;
  biografia?: string;
  semestre?: number;
  calificacionPromedio: number;
  totalTutoriasDadas: number;
  totalEstudiantesAyudados: number;
  materiasQueDomina: string[];
  calificaciones: CalificacionMentor[];
  proximasTutorias: TutoriaProxima[];
  estadisticas: EstadisticasMentor;
}

export interface CalificacionMentor {
  id: string;
  estudianteNombre: string;
  puntuacion: number;
  comentario?: string;
  fechaCreacion: string;
  esAnonima: boolean;
}

export interface TutoriaProxima {
  id: string;
  titulo: string;
  fechaHora: string;
  modalidad: string;
  cuposDisponibles: number;
  cupoMaximo: number;
}

export interface EstadisticasMentor {
  totalCalificaciones: number;
  promedioGeneral: number;
  tutoriasCompletadas: number;
  tutoriasActivas: number;
  estudiantesUnicos: number;
}

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/api/Mentores`;

  activarPerfil(data: ActivarMentorDto): Observable<ActivarMentorResponse> {
    console.log('📤 Enviando a activar mentor:', data);
    return this.http.post<ActivarMentorResponse>(`${this.apiUrl}/activar`, data);
  }

  // src/app/services/mentor.service.ts
actualizarPerfil(data: ActivarMentorDto): Observable<ActivarMentorResponse> {
  const url = `${this.apiUrl}/actualizar-perfil`;
  console.log('📤 PUT a:', url);
  console.log('📦 Payload:', JSON.stringify(data, null, 2));
  return this.http.put<ActivarMentorResponse>(url, data);
}

  // HU09: Obtener perfil público de mentor
  getPerfilPublico(mentorId: string): Observable<PerfilPublicoMentor> {
    return this.http.get<PerfilPublicoMentor>(`${this.apiUrl}/${mentorId}/perfil-publico`);
  }
}
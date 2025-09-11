// src/app/services/curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso } from '../models/curso';
import { environment } from '../../environments/environment';

// Este tipo parcial nos servirá para el método de creación.
// Excluye el 'id' que es generado por el backend.
export type CreateCursoPayload = Omit<Curso, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly apiUrl = `${environment.apiUrl}/api/Cursos`;

  constructor(private http: HttpClient) { }

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  createCurso(curso: CreateCursoPayload): Observable<Curso> {
    // En un POST, el backend nos devuelve el objeto recién creado.
    return this.http.post<Curso>(this.apiUrl, curso);
  }

  updateCurso(id: string, curso: CreateCursoPayload): Observable<void> {
    // Un PUT exitoso no devuelve contenido, por eso el tipo es 'void'.
    return this.http.put<void>(`${this.apiUrl}/${id}`, curso);
  }

  deleteCurso(id: string): Observable<void> {
    // Un DELETE exitoso tampoco devuelve contenido.
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCursoById(id: string): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }
}
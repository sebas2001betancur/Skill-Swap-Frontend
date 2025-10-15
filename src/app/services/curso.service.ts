// src/app/services/curso.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Curso } from '../models/curso';
import { environment } from '../../environments/environment';
import { CursoPreviewDto } from '../models/CursoPreviewDto';

interface UploadedImage {
  url: string;
  relativePath: string;
  filename: string;
}

// Este tipo parcial nos servirá para el método de creación.
// Excluye el 'id' que es generado por el backend.
// curso.service.ts - CORREGIDO
// curso.service.ts
export interface CreateCursoPayload {
  nombre: string;
  descripcion: string;
  descripcionLarga?: string;
  categoria: string;
  nivel: string;
  precio: number;
  imagenPrincipal?: string;  // ← CAMBIAR de imageUrl a imagenPrincipal
  imagenesGaleria?: string[];
  videoPreviewUrl?: string;
  videosAdicionales?: string[];
  puntosClave?: string[];
  duracionHoras?: number;
  numeroArticulos?: number;
  numeroLecciones?: number;
}

export interface UpdateCursoPayload {
  nombre: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  precio: number;
  imageUrl?: string; 
}

export interface UploadImageResponse {
  url: string;
  relativePath: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly apiUrl = `${environment.apiUrl}/api/Cursos`;
  private readonly managementUrl = `${environment.apiUrl}/api/curso-management`;
  private readonly http = inject(HttpClient);

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl).pipe(
      timeout(10000) // 10 seconds timeout
    );
  }

 private readonly publicApiUrl = `${environment.apiUrl}/api/public/cursos`;

  // ...
  getCursoPreview(id: string): Observable<CursoPreviewDto> {
    // --- APUNTA A LA NUEVA URL ---
    return this.http.get<CursoPreviewDto>(`${this.publicApiUrl}/preview/${id}`);
  }

    getMisCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/mis-cursos`);
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

  uploadImage(formData: FormData): Observable<UploadImageResponse> {
    return this.http.post<UploadImageResponse>(
      `${this.managementUrl}/upload-image`,
      formData
    );
  }

  uploadMultipleImages(formData: FormData): Observable<{images: UploadedImage[], count: number}> {
  return this.http.post<{images: UploadedImage[], count: number}>(
    `${this.managementUrl}/upload-images`,
    formData
  );
}

 uploadVideo(formData: FormData): Observable<{url: string, relativePath: string}> {
   return this.http.post<{url: string, relativePath: string}>(
     `${this.managementUrl}/upload-video`,
     formData
   );
 }

 getCursosComprados(): Observable<Curso[]> {
   return this.http.get<Curso[]>(`${this.apiUrl}/comprados`);
 }
}
// src/app/models/curso.ts

export interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  nivel: NivelCurso;
  precio: number;
  duracion?: number;
  imageUrl?: string;
  creadorId: string;
  creadorNombre?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  estado?: EstadoCurso;
  numeroEstudiantes?: number;
  calificacionPromedio?: number;
}

export enum NivelCurso {
  PRINCIPIANTE = 'Principiante',
  INTERMEDIO = 'Intermedio',
  AVANZADO = 'Avanzado'
}

export enum EstadoCurso {
  BORRADOR = 'Borrador',
  PUBLICADO = 'Publicado',
  ARCHIVADO = 'Archivado'
}

export interface CursoFormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  precio: number;
  duracion?: number;
  imageUrl?: string;
}
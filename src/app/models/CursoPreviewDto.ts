// src/app/models/curso-preview-dto.ts
export interface CursoPreviewDto {
  id: string;
  nombre: string;
  creadorNombre: string;
  creadorId: string;
  imageUrl: string;
  descripcionLarga: string;
  categoria: string;
  nivel: string;
  precio: number;
  puntosClave: string[];
  curriculumPreview: LeccionPreviewDto[];
  numeroLeccionesRestantes: number;
  duracionHoras: number;
  numeroArticulos: number;
  numeroLecciones: number;
}

export interface LeccionPreviewDto {
  titulo: string;
}
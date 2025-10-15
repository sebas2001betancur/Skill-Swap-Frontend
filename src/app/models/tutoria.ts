// src/app/models/tutoria.ts
export enum NivelTutoria {
  Principiante = 'Principiante',
  Intermedio = 'Intermedio',
  Avanzado = 'Avanzado',
  TodosLosNiveles = 'Todos los niveles'
}

export enum ModalidadTutoria {
  Presencial = 'Presencial',
  Virtual = 'Virtual',
  Hibrida = 'Hibrida'
}

export enum EstadoTutoria {
  Disponible = 'Disponible',
  Completa = 'Completa',
  Cancelada = 'Cancelada',
  Finalizada = 'Finalizada'
}

export enum EstadoSolicitud {
  Pendiente = 'Pendiente',
  Aceptada = 'Aceptada',
  Rechazada = 'Rechazada'
}

export interface Tutoria {
  id: string;
  titulo: string;
  descripcion: string;
  materia: string;
  nivelRequerido: string;
  modalidad: string;
  fechaHora: string;
  duracionMinutos: number;
  cupoMaximo: number;
  cuposDisponibles: number;
  ubicacionPresencial?: string;
  enlaceVirtual?: string;
  temasEspecificos?: string[];
  mentorId: string;
  mentorNombre: string;
  mentorCalificacion: number;
  estado: string;
  fechaCreacion: string;
}

export interface SolicitudTutoria {
  id: string;
  tutoriaId: string;
  estudianteId: string;
  estudianteNombre: string;
  mensaje?: string;
  estado: string;
  fechaCreacion: string;
}

export interface CrearTutoriaDto {
  titulo: string;
  descripcion: string;
  materia: string;
  nivelRequerido: string;
  modalidad: string;
  fechaHora: Date | string;
  cupoMaximo: number;
  ubicacionPresencial?: string;
  enlaceVirtual?: string;
  temasEspecificos?: string[];
}

export interface BuscarTutoriasQuery {
  materia?: string;
  modalidad?: string;
  nivel?: string;
  fecha?: string;
  busqueda?: string;
  pagina?: number;
  tamanoPagina?: number;
}

export interface TutoriasSearchResultDto {
  tutorias: Tutoria[];
  total: number;
  pagina: number;
  tamanoPagina: number;
}

export interface SolicitarTutoriaRequest {
  mensajeEstudiante?: string;
}

export interface CrearCalificacionTutoriaDto {
  puntuacion: number;
  claridad: number;
  dominioTema: number;
  puntualidad: number;
  utilidad: number;
  comentario?: string;
  esAnonima: boolean;
}

export interface CalificacionTutoriaDto {
  id: string;
  tutoriaId: string;
  estudianteId: string;
  estudianteNombre?: string;
  puntuacion: number;
  claridad: number;
  dominioTema: number;
  puntualidad: number;
  utilidad: number;
  comentario?: string;
  esAnonima: boolean;
  fechaCreacion: string;
}
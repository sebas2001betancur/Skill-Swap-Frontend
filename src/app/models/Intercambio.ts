export interface Intercambio {
  id: string;
  solicitanteId: string;
  ofertanteId: string;
  cursoSolicitadoId: string;
  cursoOfrecidoId: string;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  fechaCreacion: Date;
}

// DTO enriquecido para mostrar en la UI
export interface IntercambioDetallado extends Intercambio {
  nombreCursoSolicitado?: string;
  nombreCursoOfrecido?: string;
  nombreSolicitante?: string;
  nombreOfertante?: string;
}
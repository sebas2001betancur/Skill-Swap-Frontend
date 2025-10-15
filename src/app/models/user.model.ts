// src/app/models/user.model.ts
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  esMentor?: boolean;
  biografia?: string;
  semestre?: number;
  calificacionPromedio: number;
  totalTutoriasDadas: number;
  materiasQueDomina: string[];
  subscriptionPlan: string;
  subscriptionExpiresAt?: Date;
}
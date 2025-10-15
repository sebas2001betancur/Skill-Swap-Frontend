// Este modelo debe coincidir con el UserDto del backend
export interface UserDto {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  biografia?: string;
  materias?: string[];
  materiasQueDomina?: string[]; // Alias para mantener compatibilidad
  esMentor?: boolean;
  semestre?: number;
  calificacionPromedio?: number;
  totalTutoriasDadas?: number;
}

// Este modelo debe coincidir con el AuthResponseDto del backend
export interface AuthResponseDto {
  user: UserDto;
  token: string;
}
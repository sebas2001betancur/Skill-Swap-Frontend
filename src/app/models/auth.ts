// Este modelo debe coincidir con el UserDto del backend
export interface UserDto {
  id: string;
  nombre: string;
  email: string;
}

// Este modelo debe coincidir con el AuthResponseDto del backend
export interface AuthResponseDto {
  user: UserDto;
  token: string;
}
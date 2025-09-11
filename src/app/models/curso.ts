// src/app/models/curso.ts
export interface Curso {
  id: string; // Guid se convierte en string en JSON
  nombre: string;
  descripcion: string; // ¡La añadimos gracias a nuestra corrección!
  creadorId: string;
  categoria: string;
  nivel: string;
  precio: number;
}
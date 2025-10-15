// src/app/components/curso-card-private/curso-card-private.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CursoDto {
  id: string;
  nombre: string;
  descripcion: string;
  creadorNombre?: string;
  creadorId: string;
  categoria: string;
  nivel: string;
  precio: number;
  
}

@Component({
  selector: 'app-curso-card-private',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './curso-card-private.component.html',
  styleUrls: ['./curso-card-private.component.scss']
})
export class CursoCardPrivateComponent {
  @Input() curso!: CursoDto;
  @Input() currentUserId!: string; // CORRECCIÓN: Solo recibir el ID
  
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() exchange = new EventEmitter<string>();

  // Verificar si el usuario actual es el creador
  get isOwner(): boolean {
    return this.curso.creadorId === this.currentUserId;
  }

  onEdit(): void {
    this.edit.emit(this.curso.id);
  }

  onDelete(): void {
    if (confirm(`¿Estás seguro de eliminar el curso "${this.curso.nombre}"?`)) {
      this.delete.emit(this.curso.id);
    }
  }

  onExchange(): void {
    this.exchange.emit(this.curso.id);
  }

  truncateText(text: string, maxLength = 100): string {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  }
}
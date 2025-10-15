import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Curso } from '../../models/curso';
import { TruncatePipe } from '../../pipes/truncate.pipe'; // Importa el pipe
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-curso-card-public',
  standalone: true,
  imports: [CommonModule, TruncatePipe, RouterModule], // <-- AÑADE RouterModule AQUÍ
  templateUrl: './curso-card-public.component.html',
  styleUrls: ['./curso-card-public.component.scss']
})
export class CursoCardPublicComponent {
  @Input() curso!: Curso;
  @Output() viewDetails = new EventEmitter<void>();

  onViewDetailsClick(): void {
    this.viewDetails.emit();
  }
}
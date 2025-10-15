import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

// Services
import { MentorService, PerfilPublicoMentor } from '../../services/mentor.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-perfil-publico-mentor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './perfil-publico-mentor.component.html',
  styleUrl: './perfil-publico-mentor.component.scss'
})
export class PerfilPublicoMentorComponent implements OnInit {

  private readonly mentorService = inject(MentorService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  perfil: PerfilPublicoMentor | null = null;
  isLoading = true;

  ngOnInit(): void {
    const mentorId = this.route.snapshot.paramMap.get('id');
    if (mentorId) {
      this.cargarPerfilMentor(mentorId);
    } else {
      this.notificationService.showError('ID de mentor no encontrado');
      this.isLoading = false;
    }
  }

  private cargarPerfilMentor(mentorId: string): void {
    this.isLoading = true;

    this.mentorService.getPerfilPublico(mentorId).subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.isLoading = false;
        console.log('Perfil de mentor cargado:', perfil);
      },
      error: (error) => {
        console.error('Error cargando perfil de mentor:', error);
        this.notificationService.showError('Error al cargar el perfil del mentor');
        this.isLoading = false;
      }
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstrellas(puntuacion: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(puntuacion) ? 1 : 0);
  }
}

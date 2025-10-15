// src/app/pages/solicitar-tutoria/solicitar-tutoria.component.ts
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Services

import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { TutoriaService } from '../../services/tutoria.service';
import { SolicitarTutoriaRequest, Tutoria } from '../../models/tutoria';

@Component({
  selector: 'app-solicitar-tutoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './solicitar-tutoria.component.html',
  styleUrls: ['./solicitar-tutoria.component.scss']
})
export class SolicitarTutoriaComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  solicitudForm!: FormGroup;
  tutoria: Tutoria | null = null;
  isLoading = true;
  isSubmitting = false;
  tutoriaId: string | null = null;
  yaSolicitado = false;

  get tutoriaPasada(): boolean {
    if (!this.tutoria) return false;
    return new Date(this.tutoria.fechaHora) < new Date();
  }
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.tutoriaId = this.route.snapshot.paramMap.get('id');
    
    if (!this.tutoriaId) {
      this.notificationService.showError('ID de tutoría no válido');
      this.router.navigate(['/buscar-tutorias']);
      return;
    }
    
    this.initializeForm();
    this.cargarTutoria();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.solicitudForm = this.fb.group({
      mensaje: ['', [Validators.maxLength(500)]]
    });
  }

  private cargarTutoria(): void {
    if (!this.tutoriaId) return;
    
    this.isLoading = true;
    this.tutoriaService.getTutoriaById(this.tutoriaId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tutoria) => {
        this.tutoria = tutoria;
        this.verificarSiYaSolicitado();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar tutoría:', error);
        this.notificationService.showError('No se pudo cargar la información de la tutoría');
        this.router.navigate(['/buscar-tutorias']);
        this.isLoading = false;
      }
    });
  }

  private verificarSiYaSolicitado(): void {
    if (!this.tutoriaId || !this.authService.getCurrentUser()) return;

    this.tutoriaService.verificarSolicitudExistente(this.tutoriaId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (yaSolicitado) => {
        this.yaSolicitado = yaSolicitado;
      },
      error: (error) => {
        console.error('Error al verificar solicitud existente:', error);
        this.yaSolicitado = false; // En caso de error, permitir solicitar
      }
    });
  }

  onSubmit(): void {
    if (this.solicitudForm.invalid || !this.tutoria || !this.tutoriaId) {
      return;
    }

    // Verificar si hay cupos disponibles
    if (this.tutoria.cuposDisponibles <= 0) {
      this.notificationService.showError('Esta tutoría ya no tiene cupos disponibles');
      return;
    }

    // Verificar si la tutoría ya pasó
    const fechaTutoria = new Date(this.tutoria.fechaHora);
    const ahora = new Date();
    
    if (fechaTutoria < ahora) {
      this.notificationService.showError('Esta tutoría ya no está disponible');
      return;
    }

    // Verificar si ya solicitó
    if (this.yaSolicitado) {
      this.notificationService.showError('Ya tienes una solicitud pendiente para esta tutoría');
      return;
    }

    this.isSubmitting = true;
    
    const formData = this.solicitudForm.value;
    const usuarioActual = this.authService.getCurrentUser();
    
    if (!usuarioActual) {
      this.notificationService.showError('Debes iniciar sesión para solicitar una tutoría');
      this.router.navigate(['/login']);
      return;
    }

    const request: SolicitarTutoriaRequest = {
      mensajeEstudiante: formData.mensaje?.trim() || ''
    };

    console.log('Enviando solicitud de tutoría:', {
      tutoriaId: this.tutoriaId,
      request: request,
      usuario: usuarioActual
    });

    this.tutoriaService.solicitarTutoria(this.tutoriaId, request).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Solicitud enviada exitosamente:', response);
        this.notificationService.showSuccess('Solicitud enviada. El mentor la revisará pronto');
        this.router.navigate(['/mis-solicitudes']);
      },
      error: (error) => {
        console.error('Error al enviar solicitud:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error
        });

        let errorMessage = 'No se pudo enviar la solicitud';

        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
          this.router.navigate(['/login']);
        } else if (error.status === 409) {
          errorMessage = 'Ya tienes una solicitud pendiente para esta tutoría';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } else if (!error.status || error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }

        this.notificationService.showError(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/tutorias', this.tutoriaId]);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hayCuposDisponibles(): boolean {
    if (!this.tutoria) return false;
    return this.tutoria.cuposDisponibles > 0;
  }

  getCuposDisponibles(): number {
    if (!this.tutoria) return 0;
    return this.tutoria.cuposDisponibles;
  }

  getMensajeContador(): string {
    const mensaje = this.solicitudForm.get('mensaje')?.value || '';
    return `${mensaje.length} / 500 caracteres`;
  }

  getNivelColor(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'principiante':
        return 'primary';
      case 'intermedio':
        return 'accent';
      case 'avanzado':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
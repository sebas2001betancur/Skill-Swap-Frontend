// src/app/pages/detalle-tutoria/detalle-tutoria.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { TutoriaService } from '../../services/tutoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SolicitarTutoriaRequest, Tutoria } from '../../models/tutoria';

// Services


// Models


@Component({
  selector: 'app-detalle-tutoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './detalle-tutoria.component.html',
  styleUrls: ['./detalle-tutoria.component.scss']
})
export class DetalleTutoriaComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly _authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  tutoria: Tutoria | null = null;
  isLoading = true;
  isRequesting = false;
  isCurrentUserMentor = false;
  mostrarModalSolicitud = false;

  // Exponer authService para el template
  get authService() { return this._authService; }

  solicitudForm!: FormGroup;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/buscar-tutorias']);
      return;
    }

    // Esperar a que se cargue el estado de autenticación antes de cargar la tutoría
    this._authService.authState$.subscribe(authState => {
      console.log('DetalleTutoria - Auth state changed:', authState);
      if (!authState.isLoading && !this.tutoria) {
        this.loadTutoria(id);
      }
    });
  }

  private loadTutoria(id: string): void {
    console.log('loadTutoria - Cargando tutoría con ID:', id);
    this.tutoriaService.getTutoriaById(id).subscribe({
      next: (tutoria) => {
        console.log('loadTutoria - Tutoría cargada:', tutoria);
        this.tutoria = tutoria;
        this.isLoading = false;
        this.checkIfCurrentUserIsMentor();
        this.initializeSolicitudForm();
      },
      error: (error) => {
        console.error('Error al cargar la tutoría:', error);
        this.notificationService.showError('No se pudo cargar la tutoría');
        this.router.navigate(['/buscar-tutorias']);
      }
    });
  }

  private checkIfCurrentUserIsMentor(): void {
    const currentUser = this._authService.getCurrentUser();
    this.isCurrentUserMentor = currentUser?.id === this.tutoria?.mentorId;
  }

  private initializeSolicitudForm(): void {
    console.log('initializeSolicitudForm called');
    try {
      this.solicitudForm = this.fb.group({
        mensaje: ['', [Validators.required, Validators.maxLength(500)]]
      });
      console.log('Form initialized successfully:', this.solicitudForm);
    } catch (error) {
      console.error('Error initializing form:', error);
    }
  }

  abrirModalSolicitud(): void {
    this.mostrarModalSolicitud = true;
  }

  cerrarModalSolicitud(): void {
    this.mostrarModalSolicitud = false;
    this.solicitudForm.reset();
  }

  onSolicitarParticipacion(): void {
    try {
      console.log('onSolicitarParticipacion called');
      console.log('tutoria:', this.tutoria);
      console.log('solicitudForm:', this.solicitudForm);

      if (!this.tutoria) {
        console.error('No hay tutoría cargada');
        this.notificationService.showError('Error: no hay tutoría cargada');
        return;
      }

      if (!this.solicitudForm) {
        console.error('Form no inicializado');
        this.notificationService.showError('Error interno: formulario no inicializado');
        return;
      }

      if (this.solicitudForm.invalid) {
        console.log('Form inválido antes de extraer mensaje:', this.solicitudForm.errors);
        this.notificationService.showError('El formulario tiene errores. Verifica los campos.');
        this.isRequesting = false;
        return;
      }

      this.isRequesting = true;

      const mensaje = this.solicitudForm.value.mensaje?.trim() || '';
      console.log('Mensaje extraído:', mensaje);

      if (!mensaje) {
        console.log('Mensaje vacío, mostrando error');
        this.notificationService.showError('Por favor, escribe un mensaje explicando por qué quieres participar en esta tutoría.');
        this.isRequesting = false;
        return;
      }

    const request: SolicitarTutoriaRequest = {
      mensajeEstudiante: mensaje
    };

    console.log('Enviando solicitud con datos:', {
      tutoriaId: this.tutoria.id,
      request: request
    });

    console.log('Llamando a tutoriaService.solicitarTutoria...');
    this.tutoriaService.solicitarTutoria(this.tutoria.id, request).subscribe({
      next: (solicitud) => {
        console.log('Solicitud enviada exitosamente:', solicitud);
        this.notificationService.showSuccess('Solicitud enviada. El mentor la revisará pronto');
        this.mostrarModalSolicitud = false;
        this.router.navigate(['/mis-solicitudes']);
      },
      error: (error) => {
        console.error('Error completo al enviar solicitud:', error);
        console.error('Tipo de error:', typeof error);
        console.error('Propiedades del error:', Object.keys(error));

        let errorMessage = 'No se pudo enviar la solicitud';

        // Manejar diferentes formatos de error
        const status = error.status || error.originalError?.status;
        const backendMessage = error.message || error.error?.message || error.originalError?.error?.message;

        console.log('Status extraído:', status);
        console.log('Mensaje del backend:', backendMessage);

        if (status === 400) {
          if (backendMessage && backendMessage.includes('pendiente')) {
            errorMessage = 'Ya tienes una solicitud pendiente para esta tutoría';
          } else {
            errorMessage = backendMessage || 'Datos inválidos. Verifica la información e intenta de nuevo.';
          }
        } else if (status === 409) {
          errorMessage = 'Ya tienes una solicitud pendiente para esta tutoría';
        } else if (status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
          this.router.navigate(['/login']);
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } else if (status === 0 || !status) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }

        console.log('Mensaje de error final:', errorMessage);
        this.notificationService.showError(errorMessage);
        this.isRequesting = false;
      }
    });
    } catch (error) {
      console.error('Error inesperado en onSolicitarParticipacion:', error);
      this.notificationService.showError('Error inesperado. Inténtalo de nuevo.');
      this.isRequesting = false;
    }
  }

  onEditarTutoria(): void {
    if (this.tutoria) {
      // Navigate to edit page (if exists) or show message
      this.notificationService.showInfo('Funcionalidad de edición próximamente');
    }
  }

  onCancelarTutoria(): void {
    if (this.tutoria) {
      // Show confirmation dialog
      const confirmCancel = confirm('¿Estás seguro de que quieres cancelar esta tutoría?');
      if (confirmCancel) {
        this.tutoriaService.cancelarTutoria(this.tutoria.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tutoría cancelada exitosamente');
            this.router.navigate(['/mis-tutorias']);
          },
          error: (error) => {
            console.error('Error al cancelar tutoría:', error);
            this.notificationService.showError('No se pudo cancelar la tutoría');
          }
        });
      }
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'disponible': return 'text-green-600 bg-green-50';
      case 'llena': return 'text-yellow-600 bg-yellow-50';
      case 'completada': return 'text-blue-600 bg-blue-50';
      case 'cancelada': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getModalidadIcon(modalidad: string): string {
    switch (modalidad.toLowerCase()) {
      case 'virtual': return 'videocam';
      case 'presencial': return 'location_on';
      case 'hibrida': return 'swap_horiz';
      default: return 'help';
    }
  }

  formatFecha(fecha: string | Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  puedeSolicitar(): boolean {
    if (!this.tutoria) {
      console.log('puedeSolicitar: No hay tutoría cargada');
      return false;
    }

    const currentUser = this._authService.getCurrentUser();
    const isAuthenticated = this._authService.isLoggedIn();
    const isMentor = currentUser && this.tutoria.mentorId &&
                     String(currentUser.id) === String(this.tutoria.mentorId);

    // Verificar cada condición por separado (comparación case-insensitive)
    const estadoCorrecto = this.tutoria.estado?.toLowerCase() === 'disponible';
    const hayCupos = this.tutoria.cuposDisponibles > 0;
    const fechaFutura = new Date(this.tutoria.fechaHora) > new Date();
    const usuarioAutenticado = isAuthenticated;
    const noEsMentor = !isMentor;

    // Solo log en desarrollo
    if (!estadoCorrecto || !hayCupos || !fechaFutura || !usuarioAutenticado || !noEsMentor) {
      console.log('puedeSolicitar - Verificación detallada:', {
        tutoría: this.tutoria.titulo,
        estado: `${this.tutoria.estado} (${estadoCorrecto ? '✓' : '✗'})`,
        cupos: `${this.tutoria.cuposDisponibles} (${hayCupos ? '✓' : '✗'})`,
        fecha: `${this.tutoria.fechaHora} (${fechaFutura ? '✓' : '✗'})`,
        autenticado: `${isAuthenticated} (${usuarioAutenticado ? '✓' : '✗'})`,
        mentor: `${isMentor} (${noEsMentor ? '✓' : '✗'})`
      });
    }

    const puede = estadoCorrecto && hayCupos && fechaFutura && usuarioAutenticado && noEsMentor;

    // Log adicional para debugging
    if (!puede) {
      console.log('❌ No puede solicitar porque:', {
        estadoCorrecto: `${estadoCorrecto} (${this.tutoria.estado})`,
        hayCupos: `${hayCupos} (${this.tutoria.cuposDisponibles})`,
        fechaFutura: `${fechaFutura} (${this.tutoria.fechaHora})`,
        usuarioAutenticado: `${usuarioAutenticado}`,
        noEsMentor: `${noEsMentor} (${isMentor})`
      });
    }
    return puede;
  }

  getMensajeError(fieldName: string): string {
    const field = this.solicitudForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }

  tutoriaHaPasado(): boolean {
    if (!this.tutoria) return false;
    return new Date(this.tutoria.fechaHora) <= new Date();
  }
}
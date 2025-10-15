// src/app/components/crear-tutoria/crear-tutoria.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Services
import { TutoriaService, CrearTutoriaDto } from '../../services/tutoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

// Models
import { NivelTutoria, ModalidadTutoria } from '../../models/tutoria';

interface ValidationError {
  message?: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-crear-tutoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    FormsModule,
  ],
  templateUrl: './crear-tutoria.component.html',
  styleUrls: ['./crear-tutoria.component.scss']
})
export class CrearTutoriaComponent implements OnInit, OnDestroy {

  private readonly fb = inject(FormBuilder);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tutoriaForm!: FormGroup;

  isSubmitting = false;
  error: string | null = null;

  // Datos estáticos o que vienen del usuario
  materiasDisponibles: string[] = [];
  niveles = Object.values(NivelTutoria);
  modalidades = Object.values(ModalidadTutoria);

  // Para el input datetime-local
  minDateTime = '';

  // Para temas específicos
  nuevoTema = '';
  temasEspecificos: string[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    console.log('🚀 Iniciando CrearTutoriaComponent');
    this.setMinDateTime();
    this.initializeForm();
    this.verifyAndRefreshUser();
    this.loadMateriasFromProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setMinDateTime(): void {
    const now = new Date();
    // Agregar 1 hora como mínimo
    now.setHours(now.getHours() + 1);
    // Formato YYYY-MM-DDTHH:mm para datetime-local
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  private initializeForm(): void {
    this.tutoriaForm = this.fb.group({
      titulo: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(500)
      ]],
      materia: ['', Validators.required],
      nivelRequerido: ['', Validators.required],
      modalidad: ['', Validators.required],
      fechaHora: ['', [Validators.required]],
      cupoMaximo: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(20)
      ]],
      ubicacionPresencial: ['', []],
      enlaceVirtual: ['', []]
    });

    // Escuchar cambios en la modalidad para ajustar validaciones
    this.tutoriaForm.get('modalidad')?.valueChanges.subscribe(modalidad => {
      const ubicacionCtrl = this.tutoriaForm.get('ubicacionPresencial');
      const enlaceCtrl = this.tutoriaForm.get('enlaceVirtual');

      if (modalidad === ModalidadTutoria.Presencial || modalidad === ModalidadTutoria.Hibrida) {
        ubicacionCtrl?.setValidators([Validators.required, Validators.minLength(5)]);
      } else {
        ubicacionCtrl?.clearValidators();
      }

      if (modalidad === ModalidadTutoria.Virtual || modalidad === ModalidadTutoria.Hibrida) {
        enlaceCtrl?.setValidators([Validators.required, Validators.pattern(/^https?:\/\/.+/)]);
      } else {
        enlaceCtrl?.clearValidators();
      }

      ubicacionCtrl?.updateValueAndValidity();
      enlaceCtrl?.updateValueAndValidity();
    });
  }

  private checkPermissions(): void {
    const user = this.authService.getCurrentUser();
    const isMentor = user?.esMentor || user?.rol === 'Mentor' || user?.rol === 'Admin';
    if (!user || !isMentor) {
      this.notificationService.showError('Debes ser mentor para crear una tutoría.');
      this.router.navigate(['/convertir-mentor']);
      return;
    }
  }

   private verifyAndRefreshUser(): void {
     console.log('🔍 Verificando y asegurando actualización del usuario...');

     this.authService.ensureUserIsUpdated().subscribe({
       next: (updatedUser) => {
         if (updatedUser) {
           console.log('✅ Usuario actualizado correctamente:', updatedUser);
           this.checkPermissions(); // Verificar permisos después de actualizar
         } else {
           console.log('❌ Usuario no pudo ser actualizado, posiblemente logout forzado');
           // El usuario será redirigido automáticamente por ensureUserIsUpdated
         }
       },
       error: (err) => {
         console.error('❌ Error en ensureUserIsUpdated:', err);
         this.checkPermissions(); // Verificar de todos modos
       }
     });
   }

  private loadMateriasFromProfile(): void {
    const user = this.authService.getCurrentUser();
    console.log('🔍 Usuario actual en crear-tutoria:', user);
    console.log('🔍 Usuario - esMentor:', user?.esMentor, 'rol:', user?.rol);
    console.log('🔍 Usuario - materias:', user?.materias, 'materiasQueDomina:', user?.materiasQueDomina);

    // Verificar si tiene materias (usar el campo correcto: materiasQueDomina)
    const materias = user?.materiasQueDomina || user?.materias;
    if (materias && materias.length > 0) {
      this.materiasDisponibles = materias;
      console.log('✅ Materias cargadas:', this.materiasDisponibles);
    } else {
      console.log('❌ No se encontraron materias, intentando refrescar usuario desde backend...');
      // Intentar refrescar el usuario desde el backend antes de redirigir
      this.authService.refreshCurrentUser().subscribe({
        next: (refreshedUser) => {
          console.log('🔄 Usuario refrescado desde backend:', refreshedUser);
          const refreshedMaterias = refreshedUser?.materiasQueDomina || refreshedUser?.materias;
          if (refreshedMaterias && refreshedMaterias.length > 0) {
            this.materiasDisponibles = refreshedMaterias;
            console.log('✅ Materias cargadas después de refresh:', this.materiasDisponibles);
          } else {
            console.log('❌ Aún no hay materias después de refresh, redirigiendo a editar-perfil-mentor');
            this.notificationService.showError('Debes configurar tus materias dominadas antes de crear una tutoría.');
            this.router.navigate(['/editar-perfil-mentor']);
          }
        },
        error: (err) => {
          console.error('❌ Error al refrescar usuario:', err);
          this.notificationService.showError('Debes configurar tus materias dominadas antes de crear una tutoría.');
          this.router.navigate(['/editar-perfil-mentor']);
        }
      });
    }
  }

  agregarTemaEspecifico(): void {
    const tema = this.nuevoTema.trim();
    if (tema && this.temasEspecificos.length < 10) {
      if (tema.length > 50) {
        this.notificationService.showError('Cada tema específico debe tener máximo 50 caracteres.');
        return;
      }
      this.temasEspecificos.push(tema);
      this.nuevoTema = '';
    } else if (this.temasEspecificos.length >= 10) {
      this.notificationService.showError('Máximo 10 temas específicos.');
    }
  }

  eliminarTemaEspecifico(index: number): void {
    this.temasEspecificos.splice(index, 1);
  }

  // verificarConflictoHorario(fechaHora: Date): Observable<boolean> {
  //   return this.tutoriaService.verificarConflictoHorario(fechaHora).pipe(
  //     catchError(() => of(false))
  //   );
  // }
  

  onSubmit(): void {
    // Verificar nuevamente antes de enviar
    const user = this.authService.getCurrentUser();
    console.log('🔐 Verificación final antes de enviar:', {
      usuario: user,
      esMentor: user?.esMentor,
      rol: user?.rol
    });

    const isMentor = user?.esMentor || user?.rol === 'Mentor' || user?.rol === 'Admin';
    if (!user || !isMentor) {
      this.notificationService.showError('Debes ser mentor para crear una tutoría.');
      this.router.navigate(['/convertir-mentor']);
      return;
    }

    // Proceder con la creación (sin forzar refresh para evitar logout)
    this.proceedWithSubmission();
  }

  private proceedWithSubmission(): void {

    if (this.tutoriaForm.invalid) {
      this.markFormGroupTouched(this.tutoriaForm);
      this.notificationService.showWarning('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formData = this.tutoriaForm.value;

    // Convertir el string del datetime-local a Date y luego a ISO string
    const fechaHoraString = formData.fechaHora; // Esto es un string "YYYY-MM-DDTHH:mm"
    const fechaHora = new Date(fechaHoraString);

    // Validar que la fecha sea futura
    if (fechaHora <= new Date()) {
      this.isSubmitting = false;
      this.notificationService.showError('La fecha y hora deben ser futuras');
      return;
    }

    // Proceder directamente con la creación (el backend validará conflictos)
    const crearTutoriaDto: CrearTutoriaDto = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      materia: formData.materia,
      nivelRequerido: formData.nivelRequerido,
      modalidad: formData.modalidad,
      fechaHora: fechaHora.toISOString(), // Enviar como ISO string
      cupoMaximo: formData.cupoMaximo,
      ubicacionPresencial: (formData.modalidad === ModalidadTutoria.Presencial || formData.modalidad === ModalidadTutoria.Hibrida) && formData.ubicacionPresencial?.trim()
        ? formData.ubicacionPresencial.trim()
        : undefined,
      enlaceVirtual: (formData.modalidad === ModalidadTutoria.Virtual || formData.modalidad === ModalidadTutoria.Hibrida) && formData.enlaceVirtual?.trim()
        ? formData.enlaceVirtual.trim()
        : undefined,
      temasEspecificos: this.temasEspecificos.length > 0 ? this.temasEspecificos : undefined,
      estado: 'Disponible' // Estado por defecto para nuevas tutorías
    };

    console.log('📤 Enviando tutoría:', crearTutoriaDto);

    this.tutoriaService.crearTutoria(crearTutoriaDto).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (nuevaTutoria) => {
        console.log('✅ Tutoría creada exitosamente:', nuevaTutoria);
        this.notificationService.showSuccess('¡Tutoría creada exitosamente!');
        this.router.navigate(['/mis-tutorias']);
      },
      error: (err) => {
        console.error('❌ Error al crear la tutoría:', err);
        console.error('❌ Error completo:', {
          status: err.status,
          error: err.error,
          message: err.message
        });

        let errorMessage = 'No se pudo crear la tutoría. ';

        // Handle service error (Error instance)
        if (err instanceof Error && err.message.includes('Código de error:')) {
          const parts = err.message.split(', mensaje: ');
          if (parts.length === 2) {
            const status = parts[0].split(': ')[1];
            const backendMessage = parts[1];
            if (status === '400') {
              errorMessage = backendMessage;
            } else if (status === '401') {
              errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
              this.router.navigate(['/login']);
              return;
            } else if (status === '403') {
              errorMessage = 'No tienes permiso para realizar esta acción.';
            } else if (status === '409') {
              errorMessage = 'Ya tienes una tutoría programada en ese horario.';
            } else {
              errorMessage = backendMessage;
            }
          }
        } else if (err.status === 400 && err.error?.errors) {
          const errorMessages = err.error.errors.map((e: ValidationError) => e.message || e.errorMessage).join('. ');
          errorMessage += errorMessages;
        } else if (err.status === 400 && err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
          this.router.navigate(['/login']);
          return;
        } else if (err.status === 403) {
          errorMessage = 'No tienes permiso para realizar esta acción.';
        } else if (err.status === 409) {
          errorMessage = 'Ya tienes una tutoría programada en ese horario.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else {
          errorMessage += 'Por favor, inténtalo más tarde.';
        }

        this.error = errorMessage;
        this.notificationService.showError(errorMessage);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.tutoriaForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `Mínimo ${field.errors['min'].min}`;
    if (field.errors['max']) return `Máximo ${field.errors['max'].max}`;
    if (field.errors['pattern']) return 'Formato inválido';

    return 'Campo inválido';
  }

  cancelar(): void {
    this.router.navigate(['/mis-tutorias']);
  }
}
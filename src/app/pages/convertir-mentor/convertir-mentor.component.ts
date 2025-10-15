// src/app/pages/convertir-mentor/convertir-mentor.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MentorService, ActivarMentorDto } from '../../services/mentor.service';
import { AuthService } from '../../services/auth.service';
import { UserDto } from '../../models/auth';

@Component({
  selector: 'app-convertir-mentor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './convertir-mentor.component.html',
  styleUrls: ['./convertir-mentor.component.scss']
})
export class ConvertirMentorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mentorService = inject(MentorService);
  private authService = inject(AuthService);
  private router = inject(Router);

  mentorForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Materias disponibles (según el sistema de tutorías del backend)
  materiasDisponibles = [
    'Programación Orientada a Objetos',
    'Estructuras de Datos',
    'Bases de Datos',
    'Desarrollo Web',
    'Algoritmos',
    'Redes de Computadores',
    'Ingeniería de Software',
    'Arquitectura de Software',
    'Inteligencia Artificial',
    'Sistemas Operativos',
    'Matemáticas Discretas',
    'Cálculo',
    'Física',
    'Estadística'
  ];

  constructor() {
    // Formulario: biografía opcional, materias obligatorias, semestre opcional
    this.mentorForm = this.fb.group({
      biografia: ['', [Validators.maxLength(500)]],
      semestre: ['', [Validators.min(1), Validators.max(10), Validators.pattern(/^\d+$/)]],
      materiasQueDomina: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

    ngOnInit(): void {
    console.log('🎯 Iniciando componente ConvertirMentor');
    
    // Verificar si ya es mentor al cargar el componente
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuario actual (OnInit):', currentUser);
    
    if (currentUser?.esMentor || currentUser?.rol === 'Mentor') {
      console.log('⚠️ Usuario ya es mentor, redirigiendo...');
      this.router.navigate(['/dashboard']);
    }
    
    // No es necesario suscribirse si solo necesitas el valor inicial.
    // La suscripción a authState$ es útil si esperas que el estado cambie
    // mientras este componente está activo (por ejemplo, por un login simultáneo,
    // aunque eso es poco común).
  }

  get f() {
    return this.mentorForm.controls;
  }

  get materiasSeleccionadas(): string[] {
    return this.mentorForm.get('materiasQueDomina')?.value || [];
  }

  toggleMateria(materia: string): void {
    const materiasActuales = [...this.materiasSeleccionadas];
    const index = materiasActuales.indexOf(materia);

    if (index > -1) {
      // Remover materia
      materiasActuales.splice(index, 1);
      console.log('➖ Materia removida:', materia);
    } else {
      // Agregar materia (máximo 5 según validación del backend)
      if (materiasActuales.length >= 5) {
        this.showError('Solo puedes seleccionar máximo 5 materias');
        return;
      }
      materiasActuales.push(materia);
      console.log('➕ Materia agregada:', materia);
    }

    this.mentorForm.patchValue({ materiasQueDomina: materiasActuales });
  }

  isMateriaSelected(materia: string): boolean {
    return this.materiasSeleccionadas.includes(materia);
  }

 // src/app/pages/convertir-mentor/convertir-mentor.component.ts
onSubmit(): void {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 SUBMIT: Activar perfil de mentor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Estado del formulario:', {
    valid: this.mentorForm.valid,
    touched: this.mentorForm.touched,
    dirty: this.mentorForm.dirty
  });
  console.log('📦 Valores del formulario:', this.mentorForm.value);

  // Validar formulario
  if (this.mentorForm.invalid) {
    console.log('❌ Formulario inválido');
    this.mentorForm.markAllAsTouched();
    return;
  }

  if (this.materiasSeleccionadas.length === 0) {
    this.showError('Debes seleccionar al menos una materia');
    return;
  }

  this.isSubmitting = true;
  this.error = null;
  this.successMessage = null;

   // ✅ Preparar DTO exactamente como espera el backend
   const biografia = this.f['biografia'].value?.trim();
   const semestre = this.f['semestre'].value ? parseInt(this.f['semestre'].value, 10) : undefined;
   const activarMentorDto: ActivarMentorDto = {
     biografia: biografia || undefined, // Solo enviar si tiene contenido
     semestre: semestre, // Opcional
     MateriasQueDomine: this.materiasSeleccionadas // PascalCase
   };

  console.log('📤 DTO a enviar:', JSON.stringify(activarMentorDto, null, 2));

  this.mentorService.activarPerfil(activarMentorDto).subscribe({
    next: (response) => {
      console.log('✅ Respuesta del servidor:', response);
      
      this.successMessage = response.message;
      
        // ✅ SOLUCIÓN: Actualizar el usuario con esMentor = true y datos del formulario
        if (response.user) {
           const updatedUser = {
             ...response.user,
             esMentor: true, // Forzar a true
             rol: 'Mentor',   // Asegurar el rol
             biografia: biografia || response.user.biografia, // Incluir biografía del formulario
             semestre: semestre || response.user.semestre, // Incluir semestre del formulario
             materiasQueDomina: this.materiasSeleccionadas // Incluir materias del formulario
           };

          console.log('📝 Usuario a guardar:', updatedUser);

          // Actualizar en AuthService
          this.authService.updateCurrentUser(updatedUser);

           // Intentar refresh desde backend, pero no forzar logout si falla
           this.authService.refreshCurrentUser().subscribe({
             next: (backendUser) => {
               console.log('✅ Usuario refrescado desde backend:', backendUser);

               // Verificar que el usuario actualizado tenga el rol correcto
               if (backendUser.rol === 'Mentor' && backendUser.esMentor) {
                 console.log('✅ Usuario confirmado como Mentor en backend');
               } else {
                 console.warn('⚠️ Usuario no tiene rol Mentor en backend:', backendUser);
               }
             },
             error: (err) => {
               console.error('❌ Error al refrescar usuario:', err);
               // Usar datos locales, no hacer logout
               console.log('⚠️ Usando datos locales');
             }
           });

          // Verificar que se guardó correctamente
          const currentUser = this.authService.getCurrentUser();
          console.log('✅ Usuario después de actualizar:', currentUser);
       }
      
      this.isSubmitting = false;
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/cursos']);
      }, 2000);
    },
    error: (err) => {
      this.isSubmitting = false;
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERROR AL ACTIVAR MENTOR');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('📊 Status:', err.status);
      console.error('📝 Status Text:', err.statusText);
      console.error('🌐 URL:', err.url);
      console.error('📦 Error Body:', err.error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Manejo específico de errores
      if (err.status === 401) {
        this.showError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        setTimeout(() => this.authService.logout(), 2000);
       } else if (err.status === 400) {
         // Manejo especial para "ya tiene perfil activo"
         if (err.error?.message === 'El usuario ya tiene perfil de mentor activo') {
           console.log('⚠️ Usuario ya es mentor en backend, actualizando localmente...');
           // Actualizar localmente como mentor
           const currentUser = this.authService.getCurrentUser();
            const updatedUser = {
              ...currentUser,
              esMentor: true,
              rol: 'Mentor',
              biografia: biografia || currentUser?.biografia,
              semestre: semestre || currentUser?.semestre,
              materiasQueDomina: this.materiasSeleccionadas
            } as UserDto;
           this.authService.updateCurrentUser(updatedUser);
           this.successMessage = 'Tu perfil de mentor ya estaba activo. Datos actualizados.';
           this.isSubmitting = false;
           setTimeout(() => {
             this.router.navigate(['/cursos']);
           }, 2000);
           return;
         }
         // Errores de validación de FluentValidation
         if (err.error?.errors && Array.isArray(err.error.errors)) {
            const messages = err.error.errors.map((e: { message: string }) => e.message).join(', ');
           this.showError(messages);
         } else if (err.error?.message) {
           this.showError(err.error.message);
         } else if (typeof err.error === 'string') {
           this.showError(err.error);
         } else {
           this.showError('Datos inválidos. Verifica que hayas seleccionado al menos una materia.');
         }
      } else if (err.status === 404) {
        this.showError('Endpoint no encontrado. Verifica la configuración del servidor.');
      } else if (err.status === 0) {
        this.showError('No se puede conectar con el servidor. Verifica tu conexión.');
      } else {
        this.showError(`Error ${err.status}: ${err.statusText || 'Error desconocido'}`);
      }
    }
  });
}

  private showError(message: string): void {
    this.error = message;
    console.error('🚨 Error mostrado al usuario:', message);
    setTimeout(() => this.error = null, 7000);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.f[fieldName];
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength'])
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['minlength'])
      return 'Debes seleccionar al menos una materia';
    if (field.errors['min']) return `Mínimo ${field.errors['min'].min}`;
    if (field.errors['max']) return `Máximo ${field.errors['max'].max}`;
    if (field.errors['pattern']) return 'Solo números enteros';

    return 'Campo inválido';
  }
}
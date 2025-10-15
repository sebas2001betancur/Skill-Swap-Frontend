// src/app/pages/editar-perfil-mentor/editar-perfil-mentor.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MentorService, ActivarMentorDto } from '../../services/mentor.service';
import { AuthService } from '../../services/auth.service';
import { UserDto } from '../../models/auth';

interface ValidationError {
  message?: string;
}

@Component({
  selector: 'app-editar-perfil-mentor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './editar-perfil-mentor.component.html',
  styleUrls: ['./editar-perfil-mentor.component.scss']
})
export class EditarPerfilMentorComponent implements OnInit {
  mentorForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  currentUser: UserDto | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly mentorService = inject(MentorService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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

  ngOnInit(): void {
    this.mentorForm = this.fb.group({
      biografia: ['', [Validators.maxLength(500)]],
      semestre: ['', [Validators.min(1), Validators.max(10)]],
      materiasQueDomina: [[], [Validators.required, Validators.minLength(1)]]
    });
    this.currentUser = this.authService.getCurrentUser();
    
    console.log('📝 Usuario actual:', this.currentUser);
    
    // Verificar que sea mentor
    if (!this.currentUser?.esMentor && this.currentUser?.rol !== 'Mentor') {
      console.log('⚠️ Usuario no es mentor');
      this.router.navigate(['/convertir-mentor']);
      return;
    }

    // Cargar datos actuales del mentor
    this.mentorForm.patchValue({
      biografia: this.currentUser.biografia || '',
      semestre: this.currentUser.semestre || '',
      materiasQueDomina: this.currentUser.materiasQueDomina || []
    });

    console.log('✅ Formulario cargado con datos:', this.mentorForm.value);
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
      if (materiasActuales.length <= 1) {
        this.showError('Debes mantener al menos una materia');
        return;
      }
      materiasActuales.splice(index, 1);
      console.log('➖ Materia removida:', materia);
    } else {
      // Agregar materia (máximo 5)
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

  onSubmit(): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 ACTUALIZAR PERFIL MENTOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.mentorForm.invalid) {
      console.log('❌ Formulario inválido');
      this.mentorForm.markAllAsTouched();
      return;
    }

    if (this.materiasSeleccionadas.length === 0) {
      this.showError('Debes mantener al menos una materia');
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.successMessage = null;

    const biografia = this.f['biografia'].value?.trim();
    const semestre = this.f['semestre'].value;
    
    const actualizarDto: ActivarMentorDto = {
      biografia: biografia || undefined,
      semestre: semestre ? parseInt(semestre) : undefined,
      MateriasQueDomine: this.materiasSeleccionadas
    };

    console.log('📤 DTO a enviar:', actualizarDto);

    this.mentorService.actualizarPerfil(actualizarDto).subscribe({
      next: (response) => {
        console.log('✅ Perfil actualizado:', response);
        
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isSubmitting = false;
        
        // Actualizar usuario en AuthService
        if (response.user) {
          const updatedUser = {
            ...response.user,
            esMentor: true,
            rol: 'Mentor',
            biografia: biografia || response.user.biografia, // Incluir biografía del formulario
            semestre: semestre ? parseInt(semestre) : response.user.semestre, // Incluir semestre
            materiasQueDomina: this.materiasSeleccionadas // Incluir materias del formulario
          };

          this.authService.updateCurrentUser(updatedUser);
        }

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('❌ Error al actualizar:', err);

        if (err.status === 401) {
          this.showError('Sesión expirada. Por favor inicia sesión.');
          setTimeout(() => this.authService.logout(), 2000);
        } else if (err.status === 400) {
          if (err.error?.errors && Array.isArray(err.error.errors)) {
            const messages = err.error.errors.map((e: ValidationError) => e.message).join(', ');
            this.showError(messages);
          } else if (err.error?.message) {
            this.showError(err.error.message);
          } else {
            this.showError('Error al actualizar perfil');
          }
        } else {
          this.showError('Error de conexión. Intenta de nuevo.');
        }
      }
    });
  }

  private showError(message: string): void {
    this.error = message;
    console.error('🚨 Error:', message);
    setTimeout(() => this.error = null, 5000);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.f[fieldName];
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength']) 
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['minlength']) 
      return 'Debes mantener al menos una materia';
    if (field.errors['min']) return `Mínimo ${field.errors['min'].min}`;
    if (field.errors['max']) return `Máximo ${field.errors['max'].max}`;

    return 'Campo inválido';
  }
}
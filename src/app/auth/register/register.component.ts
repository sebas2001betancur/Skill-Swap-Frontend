import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  error: string | null = null;
  isSubmitting = false;

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.noDisposableEmailValidator // Validador para evitar emails desechables
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  /**
   * Validador personalizado: Evita emails desechables comunes
   */
  noDisposableEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    // Lista de dominios desechables comunes
    const disposableDomains = [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'yopmail.com',
      'trashmail.com',
      'getnada.com',
      'maildrop.cc'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && disposableDomains.includes(domain)) {
      return { 
        disposableEmail: { 
          message: 'No se permiten correos temporales o desechables' 
        } 
      };
    }
    
    return null;
  }

  /**
   * Validador personalizado: Contraseña segura
   * Mínimo 8 caracteres, una mayúscula y un número
   */
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    const passwordValid = hasUpperCase && hasNumber && hasMinLength;

    if (!passwordValid) {
      return {
        passwordStrength: {
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
        }
      };
    }

    return null;
  }

  /**
   * Validador a nivel de formulario: Las contraseñas deben coincidir
   */
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Manejo del envío del formulario
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const registerData = {
      nombre: this.f['nombre'].value.trim(),
      email: this.f['email'].value.trim().toLowerCase(),
      password: this.f['password'].value
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        
        this.router.navigate(['/login'], {
          state: { 
            message: 'Registro exitoso. Por favor inicie sesión',
            email: registerData.email 
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        
        if (err.status === 400) {
          const errorMessage = err.error?.message || err.error;
          
          if (errorMessage.toLowerCase().includes('email') || 
              errorMessage.toLowerCase().includes('uso')) {
            this.error = 'Este correo ya está registrado';
          } else {
            this.error = errorMessage;
          }
        } else if (err.status === 500) {
          this.error = 'Error del servidor. Por favor intenta más tarde.';
        } else {
          this.error = 'Ha ocurrido un error. Por favor verifica tus datos.';
        }
        
        console.error('Error en el registro:', err);
      }
    });
  }

  /**
   * Obtiene el mensaje de error apropiado para cada campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.f[fieldName];
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Por favor, introduce un email válido';
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['disposableEmail']) {
      return errors['disposableEmail'].message;
    }
    if (errors['passwordStrength']) {
      return errors['passwordStrength'].message;
    }

    return 'Campo inválido';
  }

  /**
   * Verifica si las contraseñas no coinciden
   */
  get passwordsDoNotMatch(): boolean {
    const confirmPassword = this.f['confirmPassword'];
    return !!(
      this.registerForm.hasError('passwordMismatch') &&
      confirmPassword.dirty &&
      confirmPassword.touched
    );
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  registerForm: FormGroup;
  error: string | null = null;
  isSubmitting = false;

  constructor(
       private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // Las validaciones aquí deben coincidir con las que muestras en el HTML
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]] // Ejemplo: mínimo 6 caracteres
    });
  }

   // Getter para un acceso más fácil a los campos en la plantilla
  get f() {
    return this.registerForm.controls;
  }

   // --- OPCIONAL: AÑADE ESTOS GETTERS ---
  get nombre() {
    return this.registerForm.get('nombre');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
  // ------------------------------------

  // El getter 'f' ya no sería necesario.
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        console.log('Registro exitoso, navegando a /cursos');
        this.router.navigate(['/cursos']);
      },
      error: (err) => {
        this.error = 'El email ya está en uso o ha ocurrido un error.';
        this.isSubmitting = false;
        console.error('Error en el registro:', err);
      }
    });
  }
}
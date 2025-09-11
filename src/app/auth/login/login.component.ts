// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.scss'] // Si tienes estilos específicos
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Getter para acceder a los controles del formulario fácilmente desde la plantilla
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log('Login exitoso, navegando a /cursos');
        // Redirigir a la página principal o a un dashboard después del login
        this.router.navigate(['/cursos']); 
      },
      error: (err) => {
        this.error = 'El email o la contraseña son incorrectos.';
        this.isSubmitting = false;
        console.error('Error en el login:', err);
      }
    });
  }
}


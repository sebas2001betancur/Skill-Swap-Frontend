import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  loginForm: FormGroup;
  error: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;
  loginAttempts = 0;
  maxAttempts = 3;
  isBlocked = false;
  blockTimeRemaining = 0;
  private blockTimer: ReturnType<typeof setInterval> | undefined;
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false] // Checkbox "Recordarme"
    });
  }

  ngOnInit(): void {
    // Verificar si viene mensaje de registro exitoso
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.successMessage = navigation.extras.state['message'];
      const email = navigation.extras.state['email'];
      if (email) {
        this.loginForm.patchValue({ email });
      }
    }

    // Verificar si hay un bloqueo activo
    this.checkBlockStatus();

    // Auto-rellenar si hay "Remember Me" guardado
    this.loadRememberedUser();
  }

  get f() {
    return this.loginForm.controls;
  }

  /**
   * Verificar si el usuario está bloqueado
   */
  checkBlockStatus(): void {
    if (!this.isBrowser) return;

    const blockUntil = localStorage.getItem('loginBlockUntil');
    if (blockUntil) {
      const blockTime = new Date(blockUntil).getTime();
      const now = new Date().getTime();

      if (now < blockTime) {
        this.isBlocked = true;
        //this.blockTimeRemaining = Math.ceil((blockTime - now) / 1000 / 60); // minutos
        this.startBlockTimer(blockTime);
      } else {
        // El bloqueo expiró
        localStorage.removeItem('loginBlockUntil');
        localStorage.removeItem('loginAttempts');
      }
    }
  }

  /**
   * Iniciar temporizador de bloqueo
   */
  startBlockTimer(blockTime: number): void {
    this.blockTimer = setInterval(() => {
      const now = new Date().getTime();
      this.blockTimeRemaining = Math.ceil((blockTime - now) / 1000 / 60);

      if (this.blockTimeRemaining <= 0) {
        clearInterval(this.blockTimer);
        this.isBlocked = false;
        if (this.isBrowser) {
          localStorage.removeItem('loginBlockUntil');
          localStorage.removeItem('loginAttempts');
        }
        this.loginAttempts = 0;
      }
    }, 1000);
  }

  /**
   * Cargar usuario recordado
   */
  loadRememberedUser(): void {
    if (!this.isBrowser) return;

    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  /**
   * Incrementar intentos fallidos
   */
  incrementFailedAttempts(): void {
    this.loginAttempts++;
    if (this.isBrowser) {
      localStorage.setItem('loginAttempts', this.loginAttempts.toString());
    }

    if (this.loginAttempts >= this.maxAttempts) {
      // Bloquear por 15 minutos
      const blockUntil = new Date();
      blockUntil.setMinutes(blockUntil.getMinutes() + 15);
      if (this.isBrowser) {
        localStorage.setItem('loginBlockUntil', blockUntil.toISOString());
      }

      this.isBlocked = true;
      this.blockTimeRemaining = 15;
      this.startBlockTimer(blockUntil.getTime());

      this.error = 'Cuenta bloqueada temporalmente por seguridad. Intenta en 15 minutos.';
    } else {
      const attemptsLeft = this.maxAttempts - this.loginAttempts;
      this.error = `Email o contraseña incorrectos. ${attemptsLeft} ${attemptsLeft === 1 ? 'intento' : 'intentos'} restante${attemptsLeft === 1 ? '' : 's'}.`;
    }
  }

  /**
   * Resetear intentos tras login exitoso
   */
  resetFailedAttempts(): void {
    this.loginAttempts = 0;
    if (this.isBrowser) {
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginBlockUntil');
    }
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
    }
  }

  /**
   * Manejar "Recordarme"
   */
  handleRememberMe(email: string): void {
    if (!this.isBrowser) return;

    if (this.loginForm.value.rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }

  /**
   * Envío del formulario
   */
  onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  if (this.isBlocked) {
    this.error = `Cuenta bloqueada. Intenta en ${this.blockTimeRemaining} minuto${this.blockTimeRemaining === 1 ? '' : 's'}.`;
    return;
  }

  this.isSubmitting = true;
  this.error = null;
  this.successMessage = null;

  const loginData = {
    email: this.f['email'].value.trim().toLowerCase(),
    password: this.f['password'].value
  };

  this.authService.login(loginData).subscribe({
    next: (response) => {
      console.log('Login exitoso:', response);
      
      // ❌ ELIMINA ESTA LÍNEA:
      // this.authService.setAuthData(response);
      
      // ✅ El AuthService ya guardó todo internamente
      
      // Resetear intentos fallidos
      this.resetFailedAttempts();
      
      // Manejar "Recordarme"
      this.handleRememberMe(loginData.email);
      
      // Redirigir al dashboard
      this.router.navigate(['/cursos']);
    },
    error: (err) => {
      this.isSubmitting = false;
      
      if (err.status === 400 || err.status === 401) {
        this.incrementFailedAttempts();
      } else if (err.status === 500) {
        this.error = 'Error del servidor. Por favor intenta más tarde.';
      } else {
        this.error = 'Error al iniciar sesión. Verifica tu conexión.';
      }
      
      console.error('Error en login:', err);
    }
  });
}

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.f[fieldName];
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }

  ngOnDestroy(): void {
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
    }
  }
  
}
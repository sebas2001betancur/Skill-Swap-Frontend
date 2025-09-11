import { Routes } from '@angular/router';

// 1. Importa los componentes que actuarán como páginas
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CursoListComponent } from './components/curso-list/curso-list.component';
import { CursoFormComponent } from './components/curso-form/curso-form.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // --- Rutas de Autenticación ---
    { 
        path: 'login',
        component: LoginComponent
    },
    { 
        path: 'register',
        component: RegisterComponent
    },

    // --- Rutas de Cursos ---
    {
        path: 'cursos', // Ruta ÚNICA para la lista de cursos
        component: CursoListComponent
    },
    { path: 'login', component: LoginComponent },
    { 
        path: 'register', component: RegisterComponent 
    },
    {
        path: 'curso/nuevo',
        component: CursoFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'curso/editar/:id',
        component: CursoFormComponent,
        canActivate: [authGuard]
    },
    
    // --- Rutas de Redirección ---
    { 
        path: '',
        redirectTo: '/cursos',
        pathMatch: 'full'
    },
    { 
        path: '**',
        redirectTo: '/cursos'
    }
];
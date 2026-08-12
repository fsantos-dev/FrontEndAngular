// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { AuthLayout } from '../../layout/auth/auth-layout';


export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];

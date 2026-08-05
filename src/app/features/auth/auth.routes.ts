// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';


export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
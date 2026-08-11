import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { InputPasswordModule } from 'primeng/inputpassword';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    InputPasswordModule,
    SelectModule
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  loginForm: FormGroup;

  countries = [
  { name: 'Colombia', code: 'CO' },
  { name: 'México', code: 'MX' },
  { name: 'Argentina', code: 'AR' }
];

  constructor(
    private fb: FormBuilder,
    public authStore: AuthStore,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const credentials = this.loginForm.value;
    this.authStore.login(credentials);
  }
}

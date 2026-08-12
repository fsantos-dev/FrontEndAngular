import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../core/auth/auth.store';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { InputPasswordModule } from 'primeng/inputpassword';
import { LoginForm } from '../../models/auth-model';


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
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  protected readonly authStore = inject(AuthStore);

  loginForm: FormGroup<LoginForm> = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email, Validators.maxLength(150)]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
  });

  protected get email() {
     return this.loginForm.controls.email;
  }

  protected get password() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    const credentials = this.loginForm.getRawValue();
    this.authStore.login(credentials);
  }
}

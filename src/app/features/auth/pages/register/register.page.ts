import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthStore } from '../../../../core/auth/auth.store';
import { RegisterForm } from '../../models/auth-model';
import { passwordMatchValidator } from '../../../../shared/validators/password-match-validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, CardModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  protected readonly authStore = inject(AuthStore);

  registerForm: FormGroup<RegisterForm> = this.fb.nonNullable.group(
    {
      fullName: this.fb.nonNullable.control('', [Validators.maxLength(100)]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ]),
      password: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
      ]),
      repeatPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
      ]),
    },
    { validators: passwordMatchValidator('password', 'repeatPassword') },
  );

  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    const { repeatPassword, ...registerData } = this.registerForm.getRawValue();
    this.authStore.register(registerData);
  }

  protected get fullName() {
    return this.registerForm.controls.fullName;
  }
  protected get password() {
    return this.registerForm.controls.password;
  }
  protected get repeatPassword() {
    return this.registerForm.controls.repeatPassword;
  }
}

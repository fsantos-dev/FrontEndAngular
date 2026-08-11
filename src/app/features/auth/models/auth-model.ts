import { Form, FormControl } from "@angular/forms";

export interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface RegisterForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  repeatPassword: FormControl<string>;
}
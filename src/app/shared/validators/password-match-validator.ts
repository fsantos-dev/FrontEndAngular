import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordKey: string,
  repeatPasswordKey: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const repeatPassword = group.get(repeatPasswordKey)?.value;

    if (!password || !repeatPassword) return null;

    return password === repeatPassword ? null : { passwordMismatch: true };
  };
}

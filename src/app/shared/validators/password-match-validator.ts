import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordKey: string,
  repeatPasswordKey: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const passwordControl = group.get(passwordKey);
    const repeatPasswordControl = group.get(repeatPasswordKey);

    if (!passwordControl || !repeatPasswordControl) return null;

    if (passwordControl.value !== repeatPasswordControl.value) {
      repeatPasswordControl.setErrors({
        ...repeatPasswordControl.errors,
        passwordMismatch: true,
      });
    } else if (repeatPasswordControl.hasError('passwordMismatch')) {
      const errors = { ...repeatPasswordControl.errors };
      delete errors['passwordMismatch'];
      repeatPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  };
}

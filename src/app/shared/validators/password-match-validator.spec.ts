import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './password-match-validator';
import { describe, expect, it } from 'vitest';

describe('passwordMatchValidator', () => {
  it('should add passwordMismatch when passwords are different', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl('123456'),
      repeatPassword: new FormControl('654321'),
    });

    const validator = passwordMatchValidator('password', 'repeatPassword');

    // Act
    validator(form);

    // Assert
    expect(form.controls.repeatPassword.hasError('passwordMismatch')).toBe(true);
  });

  it('should remove passwordMismatch when passwords match', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl('123456'),
      repeatPassword: new FormControl('654321'),
    });

    const validator = passwordMatchValidator('password', 'repeatPassword');

    validator(form);

    // Act
    form.controls.repeatPassword.setValue('123456');
    validator(form);

    // Assert
    expect(form.controls.repeatPassword.hasError('passwordMismatch')).toBe(false);
  });

  it('should return null when password controls do not exist', () => {
    // Arrange
    const form = new FormGroup({
      password: new FormControl('123456'),
    });

    const validator = passwordMatchValidator('password', 'repeatPassword');

    // Act
    const result = validator(form);

    // Assert
    expect(result).toBeNull();
  });
});

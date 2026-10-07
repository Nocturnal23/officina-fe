import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export interface PasswordRequirements {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumeric: boolean;
    hasSpecial: boolean;
    isValidLength: boolean;
}

export function checkPasswordRequirements(value: string): PasswordRequirements {
    const val = value || '';
    return {
        hasUpperCase: /[A-Z]+/.test(val),
        hasLowerCase: /[a-z]+/.test(val),
        hasNumeric: /[0-9]+/.test(val),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(val),
        isValidLength: val.length >= 8
    };
}

export function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const reqs = checkPasswordRequirements(control.value);

        const passwordValid = reqs.hasUpperCase && reqs.hasLowerCase &&
            reqs.hasNumeric && reqs.hasSpecial && reqs.isValidLength;

        if (!passwordValid) {
            return {
                strongPassword: reqs
            };
        }
        return null;
    };
}

export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const control = formGroup.get(controlName);
        const matchingControl = formGroup.get(matchingControlName);

        if (!control || !matchingControl) return null;
        if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) return null;

        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        } else {
            matchingControl.setErrors(null);
            return null;
        }
    };
}
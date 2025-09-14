import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class PasswordValidators {
    constructor() {}

    static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                // if control is empty return no error.
                return null;
            }

            // test the value of the control against the regexp supplied.
            const valid = regex.test(control.value);

            // if true, return no error, else return error passed in the second parameter.
            return valid ? null : error;
        };
    }
}

export class CustomValidators {

    constructor() {}

    static MatchingPasswords(control: AbstractControl) {
        const password = control.get('password')?.value;
        const confirmControl = control.get('confirmPassword');

        if (!confirmControl) {
            return null; // nothing to validate if confirmPassword control is missing
        }

        const confirmPassword = confirmControl.value;
        const currentErrors = confirmControl.errors || {};

        if (compare(password, confirmPassword)) {
            confirmControl.setErrors({ ...currentErrors, not_matching: true });
        } 
        else {
            // remove the "not_matching" error but keep others
            const { not_matching, ...rest } = currentErrors;
            confirmControl.setErrors(Object.keys(rest).length ? rest : null);
        }

        return null;
    }

}

function compare(password: string,confirmPassword: string) {
    return password !== confirmPassword && confirmPassword !== ''
}



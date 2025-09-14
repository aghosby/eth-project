import { ValidatorFn } from "@angular/forms";

export interface FormFields {
    controlName: string,
    controlType: string,
    controlLabel: string,
    controlWidth: string,
    initialValue: any,
    placeholder?: string,
    readonly?: boolean,
    selectOptions?: {[key: string]: string},
    validators?: ValidatorFn[],
    visible?:boolean,
    order: number
}
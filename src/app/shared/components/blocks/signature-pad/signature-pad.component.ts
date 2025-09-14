import { Component, forwardRef, ViewChild, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SignaturePad } from 'angular2-signaturepad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignaturePadComponent),
      multi: true
    }
  ]
})
export class SignaturePadComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild(SignaturePad) signaturePad!: SignaturePad;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  value: string | null = null;

  signaturePadOptions: Object = {
    minWidth: 2,
    canvasWidth: 300,
    canvasHeight: 150,
    backgroundColor: '#f6f6f6',
    penColor: 'black'
  };

  ngAfterViewInit() {
    this.signaturePad.clear();
  }

  drawComplete() {
    this.value = this.signaturePad.toDataURL();
    this.onChange(this.value);
    this.onTouched();
  }

  clearSignature() {
    this.signaturePad.clear();
    this.value = null;
    this.onChange(this.value);
  }

  // ControlValueAccessor methods
  writeValue(value: string | null): void {
    this.value = value;
    if (value) {
      const canvas = this.signaturePad.fromDataURL(value);
      // const ctx = canvas.getContext('2d');
      // if (ctx) {
      //   const img = new Image();
      //   img.src = value;
      //   img.onload = () => ctx.drawImage(img, 0, 0);
      // }
    } else if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.signaturePad) {
      if (isDisabled) {
        this.signaturePad.off();
      } else {
        this.signaturePad.on();
      }
    }
  }
}

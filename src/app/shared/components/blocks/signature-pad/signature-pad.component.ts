import { Component, forwardRef, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import SignaturePad from 'signature_pad';

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
  @ViewChild('signatureCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;
  private pendingValue: string | null = null;
  
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  value: string | null = null;

  signaturePadOptions = {
    minWidth: 2,
    maxWidth: 4,
    backgroundColor: 'rgb(246, 246, 246)',
    penColor: 'black',
    canvasWidth: 300,
    canvasHeight: 150
  };

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.signaturePadOptions.canvasWidth;
    canvas.height = this.signaturePadOptions.canvasHeight;
    
    this.signaturePad = new SignaturePad(canvas, {
      minWidth: this.signaturePadOptions.minWidth,
      maxWidth: this.signaturePadOptions.maxWidth,
      backgroundColor: this.signaturePadOptions.backgroundColor,
      penColor: this.signaturePadOptions.penColor
    });
    
    this.signaturePad.addEventListener('endStroke', () => this.drawComplete());
    this.signaturePad.clear();

    if (this.pendingValue) {
      //this.signaturePad.fromDataURL(this.pendingValue);
      this.signaturePad.fromDataURL(this.pendingValue!, {
        width: 200,
        height: 100,
        xOffset: 40,
        yOffset: 15
      });
      this.pendingValue = null;
    }
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
    console.log('Val', value);
    this.value = value;
    if (this.signaturePad) {
      if (value) {
        this.signaturePad.fromDataURL(value);
      } 
      else {
        this.signaturePad.clear();
      }
    } 
    else {
      // Pad not ready yet → save for later
      this.pendingValue = value;
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

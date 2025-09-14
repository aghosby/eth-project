import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProfilePhotoComponent),
      multi: true
    }
  ]
})
export class ProfilePhotoComponent implements ControlValueAccessor {
  @Input() initialUrl: string | null = null; // Optional input for existing profile photo

  profilePic: string | null = null; // preview
  file: File | null = null;

  private onChange: any = () => {};
  private onTouched: any = () => {};
  disabled = false;

  // Handle input from parent (formControl value or initialUrl)
  writeValue(value: string | null): void {
    this.profilePic = value || this.initialUrl || null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  profilePicUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];

      // Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePic = reader.result as string;
        this.onChange(this.file); // pass file back to form control
      };
      reader.readAsDataURL(this.file);
    }
  }
}

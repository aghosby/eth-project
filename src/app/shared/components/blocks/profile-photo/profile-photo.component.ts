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
  errorMessage: string | null = null; // for validation feedback

  private onChange: any = () => {};
  private onTouched: any = () => {};
  disabled = false;

  // Handle input from parent (formControl value or initialUrl)
  writeValue(value: string | File | null): void {
    if (value instanceof File) {
      this.file = value;
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePic = reader.result as string;
      };
      reader.readAsDataURL(value);
    } else if (typeof value === 'string') {
      this.profilePic = value || this.initialUrl || null;
    } else {
      this.profilePic = this.initialUrl || null;
    }
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
      const file = input.files[0];

      // Validate size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 2MB';
        this.file = null;
        this.profilePic = this.initialUrl || null;
        this.onChange(null);
        return;
      }

      this.errorMessage = null;
      this.file = file;

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

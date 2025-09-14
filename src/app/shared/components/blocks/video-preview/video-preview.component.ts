import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VideoPreviewComponent),
      multi: true
    }
  ]
})
export class VideoPreviewComponent implements ControlValueAccessor {
  @Input() initialUrl: string | null = null; // Existing video (from server, e.g. S3 link)
  @Input() label = 'Upload Video';
  @Input() preamble = 'Attach your performance video';

  videoUrl: string | null = null; // for preview
  file: File | null = null;
  fileName: string | null = null;
  error: string | null = null;

  private onChange: any = () => {};
  private onTouched: any = () => {};
  disabled = false;

  // Max size = 10MB
  readonly MAX_SIZE = 10 * 1024 * 1024;

  writeValue(value: any): void {
    if (typeof value === 'string') {
      this.videoUrl = value;
    } else {
      this.videoUrl = this.initialUrl || null;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > this.MAX_SIZE) {
        this.error = 'File is too large. Maximum size is 3MB.';
        this.file = null;
        this.videoUrl = null;
        this.fileName = null;
        this.onChange(null);
        return;
      }

      this.error = null;
      this.file = file;
      this.fileName = file.name;

      // Preview
      this.videoUrl = URL.createObjectURL(file);

      this.onChange(file); // send File object back to form control
    }
  }
}

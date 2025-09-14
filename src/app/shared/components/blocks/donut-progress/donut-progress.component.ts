import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-donut-progress',
  templateUrl: './donut-progress.component.html',
  styleUrls: ['./donut-progress.component.scss']
})
export class DonutProgressComponent implements OnChanges {
  /** percentage value (0–100) */
  @Input() value: number = 0;

  /** size of the donut */
  @Input() size: string = '120px';

  /** ring thickness */
  @Input() thickness: string = '16px';

  /** progress color */
  @Input() color: string = '#2EA3F2';

  /** background ring color */
  @Input() bg: string = '#eee';

  displayedValue: number = 0; // animated number shown in the center

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.animateValue(changes['value'].previousValue || 0, this.value, 800);
    }
  }

  private animateValue(start: number, end: number, duration: number) {
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      this.displayedValue = Math.round(start + (end - start) * progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}

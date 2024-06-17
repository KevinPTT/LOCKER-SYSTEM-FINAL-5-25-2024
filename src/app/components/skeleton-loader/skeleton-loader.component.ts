import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() isLoading: boolean = true; // Use @Input to receive the isLoading value from the parent component
  lockerCount: number = 100;

  getLockerArray(): number[] {
    return Array.from({ length: this.lockerCount }, (_, index) => index + 1);
  }
}

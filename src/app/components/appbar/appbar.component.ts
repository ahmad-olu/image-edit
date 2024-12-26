import { Component, inject } from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [],
  template: `
    <div class="px-8 flex items-center justify-evenly space-x-4">
      <button
        class="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-red-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        (click)="imageService.importImage()"
      >
        Upload Image
      </button>

      <div class="text-center flex-1  text-sm">
        Mini <mark class="text-lg font-mono">IMAGE</mark> Editor
      </div>
      <button
        class="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-red-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        (click)="imageService.saveImage()"
      >
        Save Image
      </button>
    </div>
  `,
  styles: ``,
})
export class AppbarComponent {
  imageService = inject(ImageService);
}

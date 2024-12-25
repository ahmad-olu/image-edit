import { Component, inject, signal } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { NgIf } from '@angular/common';
import { AppbarComponent } from '../../components/appbar/appbar.component';
import { EditBarComponent } from '../../components/edit-bar/edit-bar.component';
import { invoke } from '@tauri-apps/api/core';

// fixme: make sure the empty or null image type state ui is covered.

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, AppbarComponent, EditBarComponent],
  template: `
    <app-appbar />
    <div class="flex flex-col items-center p-4">
      <div class="flex flex-col items-center p-4">
        @if (processing() === true) {
          Processing...
        }
        <!-- {{ toggleDescription() }} -->
        {{ dbg() }}
        <!-- {{ toggleAndDescription().resize.showDescription }} -->
        <div class="flex justify-center items-center w-full h-auto">
          @if (showEditedImage() === true) {
            <div
              class="flex bg-gray-50 w-full md:w-auto transition-opacity duration-1000 "
            >
              <img
                *ngIf="imageService.editedImagePath()"
                [src]="imageService.editedImagePath()"
                alt="Edited Image"
                class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
                [style.height]="'30rem'"
              />
            </div>
          } @else {
            <div
              class="flex bg-gray-50 w-full md:w-auto transition-opacity duration-1000 "
            >
              <img
                *ngIf="imageService.originalImagePath()"
                [src]="imageService.originalImagePath()"
                alt="Original Image"
                class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
                [style.height]="'30rem'"
              />
            </div>
          }
        </div>
      </div>
      <!-- Toggle Button -->
      <div class="text-center mt-4">
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-600"
          (click)="toggleImage()"
        >
          Toggle Image
        </button>
        <app-edit-bar />
        <div class="mb-2">
          <button
            class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-red-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            (click)="imageService.editImage()"
          >
            Edit Image
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class HomeComponent {
  imageData = signal<string | null>(null);
  //   originalImagePath = signal<string | null>(null);
  //   editedImagePath = signal<string | null>(null);
  processing = signal<boolean>(false);

  showEditedImage = signal<boolean>(true);
  toggleImage() {
    this.showEditedImage.set(!this.showEditedImage());
  }

  dbg = signal<string>('0');

  imageService = inject(ImageService);

  constructor(private fileService: ImageService) {
    fileService.getImage();
  }
}

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
      <div class="mb-2">
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-600"
          (click)="imageService.saveImage()"
        >
          Save Image
        </button>
      </div>
      <div class="flex flex-col items-center p-4">
        <div class="mb-2">
          <button
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-600"
            (click)="imageService.importImage()"
          >
            Upload Image
          </button>
        </div>
        @if (processing() === true) {
          Processing...
        }
        <!-- {{ toggleDescription() }} -->
        {{ dbg() }}
        <!-- {{ toggleAndDescription().resize.showDescription }} -->
        <div class="flex justify-center items-center w-full h-auto">
          <div class="flex bg-gray-50 w-full md:w-auto">
            <img
              *ngIf="imageService.editedImagePath()"
              [src]="imageService.editedImagePath()"
              alt="Edited Image"
              class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
              [style.height]="'30rem'"
            />
          </div>
        </div>
      </div>
      <app-edit-bar />
      <div class="mb-2">
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-600"
          (click)="imageService.editImage()"
        >
          Edit Image
        </button>
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

  dbg = signal<string>('0');

  imageService = inject(ImageService);

  constructor(private fileService: ImageService) {
    fileService.getImage();
  }
}

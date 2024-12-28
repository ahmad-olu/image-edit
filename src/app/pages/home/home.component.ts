import { Component, forwardRef, inject, signal } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { AppbarComponent } from '../../components/appbar/appbar.component';
import { EditBarComponent } from '../../components/edit-bar/edit-bar.component';

// fixme: make sure the empty or null image type state ui is covered.

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AppbarComponent,
    EditBarComponent,
    forwardRef(() => DialogComponent),
  ],
  template: `
    <div class="px-2">
      <app-appbar />
      <div class="flex flex-col items-center p-2">
        <div class="flex flex-col items-center p-2">
          <app-dialog />
          <div class="flex justify-center items-center w-96 h-auto">
            @if (showEditedImage() === true) {
              @if (imageService.processing() === false) {
                <div
                  class="flex bg-gray-50 w-full md:w-auto transition-opacity duration-1000 "
                >
                  @if (
                    imageService.editedImagePath() !==
                      'data:image/png;base64,' &&
                    imageService.editedImagePath() !== null &&
                    imageService.editedImagePath() !== ''
                  ) {
                    <img
                      [src]="imageService.editedImagePath()"
                      alt="Edited Image"
                      class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
                      [style.height]="'30rem'"
                    />
                  } @else {
                    <img
                      src="assets/placeholder.png"
                      alt="Placeholder Image"
                      class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
                      [style.height]="'30rem'"
                    />
                  }
                </div>
              } @else {
                <!-- Shimmer Effect -->
                <div
                  class="relative w-full h-64 bg-gray-300 rounded-lg overflow-hidden"
                >
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 animate-shimmer"
                  ></div>
                </div>
              }
            } @else {
              <div
                class="flex bg-gray-50 w-full md:w-auto transition-opacity duration-1000 "
              >
                @if (
                  imageService.originalImagePath() !==
                    'data:image/png;base64,' &&
                  imageService.originalImagePath() !== null &&
                  imageService.originalImagePath() !== ''
                ) {
                  <img
                    [src]="imageService.originalImagePath()"
                    alt="Edited Image"
                    class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
                    [style.height]="'30rem'"
                  />
                } @else {
                  <img
                    src="assets/placeholder.png"
                    alt="Placeholder Image"
                    class="w-full h-96 md:w-auto md:h-96 object-scale-down border-r-4 rounded-[12px]"
                    [style.height]="'30rem'"
                  />
                }
              </div>
            }
          </div>
        </div>
        <!-- Toggle Button -->
        <div class="text-center mt-4">
          <button
            class="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-red-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            (click)="toggleImage()"
          >
            Toggle Image
          </button>
          <app-edit-bar />
          <div class="mb-2">
            <button
              class="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-red-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
              (click)="imageService.editImage()"
            >
              Edit Image
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class HomeComponent {
  imageData = signal<string | null>(null);

  //processing = signal<boolean>(false);

  showEditedImage = signal<boolean>(true);
  toggleImage() {
    this.showEditedImage.set(!this.showEditedImage());
  }

  // dbg = signal<string>('0');

  imageService = inject(ImageService);

  constructor(private fileService: ImageService) {
    fileService.getImage();
  }
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    <!-- Main Button -->
    <button
      type="button"
      class="bg-black text-white px-6 py-1 rounded-lg hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      (click)="openDialog()"
    >
      📚️
    </button>

    <!-- Dialog -->
    @if (isDialogOpen()) {
      <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div
          class="bg-white rounded-lg p-6 max-w-lg w-full text-center shadow-lg relative"
        >
          <button
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            (click)="closeDialog()"
          >
            ✖️
          </button>
          <h2 class="text-xl font-bold mb-4">How to Use the App</h2>
          <div class="p-4 border rounded-md bg-gray-100">
            <ul class="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Activate Editing Features:</strong>
                Check the corresponding
                <span class="inline-block p-1 bg-blue-200 text-blue-800 rounded"
                  >checkbox <input type="checkbox"
                /></span>
                to enable the editing feature you want to apply to the image.
              </li>
              <li>
                <strong>Set Values:</strong>
                Use the
                <span
                  class="inline-block p-1 bg-green-200 text-green-800 rounded"
                  >toggle button
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" />
                    <div
                      class="relative py-1 px-1  w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                    ></div> </label
                ></span>
                or
                <span
                  class="inline-block p-1 bg-yellow-200 text-yellow-800 rounded"
                  >input box <input type="number" class="w-12"
                /></span>
                to define the specific value for the selected editing feature.
              </li>
              <li>
                <strong>Value Descriptions:</strong>
                Look for the <span class="text-2xl">🧾📕</span> emoji in front
                of an input field. It provides guidance on the type of value to
                be entered. For example:
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <span class="text-2xl">📦️</span>
                    <strong>Brightness:</strong> Enter a number between -100 and
                    100.
                  </li>
                  <li>
                    <span class="text-2xl">📦️</span>
                    <strong>Contrast:</strong> Enter a percentage value (e.g.,
                    50%).
                  </li>
                  <li>
                    <span class="text-2xl">📦️</span>
                    <strong>Rotate:</strong> Enter an angle in degrees (e.g.,
                    90).
                  </li>
                </ul>
              </li>
              <li>
                <strong>Preview Changes:</strong>
                As you toggle features and adjust values, you can see a live
                preview of the changes applied to your image.
              </li>
            </ul>
          </div>

          <button
            class="bg-red-900 text-white px-8 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            (click)="closeDialog()"
          >
            Close
          </button>
        </div>
      </div>
    }
  `,
  styles: ``,
})
export class DialogComponent {
  isDialogOpen = signal(false);

  openDialog(): void {
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
  }
}

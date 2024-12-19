import { Component, signal } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { NgIf } from '@angular/common';
import { AppbarComponent } from '../../components/appbar/appbar.component';
import { open } from '@tauri-apps/plugin-dialog';
import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import {
  createManipulationParams,
  ManipulationParams,
} from '../../model/manipulation-params';

export interface ImageState {
  og_image?: Uint8Array;
  edit_image?: Uint8Array;
}
type rt = 'w' | 'h';
// fixme: make sure the empty or null image type state ui is covered.

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, AppbarComponent],
  template: `
    <app-appbar />
    <div class="flex flex-col items-center p-4">
      <div class="mb-2">
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-600"
          (click)="importImage()"
        >
          Upload Image
        </button>
      </div>
      @if (processing() === true) {
        Processing...
      }
      <!-- {{ toggleDescription() }} -->
      {{ dbg() }}
      <div class="flex w-full h-auto">
        <div class="flex-none bg-gray-50">
          <img
            *ngIf="imagePath()"
            [src]="imagePath()"
            alt="Original Image"
            class="w-auto h-96 object-scale-down border-r-4"
          />
        </div>
        <!-- <div class="flex-1 bg-gray-200">
            <img
            *ngIf="editedImageSrc"
            [src]="editedImageSrc"
            alt="Edited Image"
            class="w-full h-full object-contain"
          />
          </div> -->
      </div>
    </div>
    <div class="">
      <div
        class="mb-4 ms-4 flex items-center space-x-2"
        [class]="isResizeEnable() ? '' : 'opacity-40'"
      >
        <input
          type="checkbox"
          id="enableResize"
          [value]="isResizeEnable()"
          (change)="onInputBoolChange($event)"
          class="mr-2"
        />
        <h6 class="text-gray-700">Resize:</h6>
        <input
          type="number"
          [value]="resizeWidth()"
          (change)="onInputChange($event, 'w')"
          placeholder="Width"
          class="p-2 border rounded w-20"
        />
        <input
          type="number"
          [value]="resizeHeight()"
          (change)="onInputChange($event, 'h')"
          placeholder="Height"
          class="p-2 border rounded w-20"
        />
        <span
          class="ml-auto cursor-pointer text-blue-500"
          (click)="toggleDescription()"
          title="Toggle Description"
        >
          show
        </span>
      </div>
      <div *ngIf="showDescription()" class="text-sm text-gray-600">
        <p>Enter the desired dimensions for the image resize:</p>
        <ul class="list-disc pl-5">
          <li><b>Width:</b> The width in pixels for the resized image.</li>
          <li><b>Height:</b> The height in pixels for the resized image.</li>
        </ul>
      </div>
    </div>
    <div class="mb-2">
      <button
        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-600"
        (click)="editImage()"
      >
        Edit Image
      </button>
    </div>
  `,
  styles: ``,
})
export class HomeComponent {
  imageData = signal<string | null>(null);
  imagePath = signal<string | null>(null);
  processing = signal<boolean>(false);

  params = signal<ManipulationParams>(createManipulationParams());
  dbg = signal<string>('0');

  resizeWidth = signal<number>(100);
  resizeHeight = signal<number>(100);

  isResizeEnable = signal<boolean>(true);
  showDescription = signal<boolean>(false);

  onInputBoolChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;

    this.isResizeEnable.set(value);
  }

  toggleDescription(): void {
    if (this.showDescription() === true) {
      this.showDescription.set(false);
    } else {
      this.showDescription.set(true);
    }
  }

  // Generic function to handle changes
  onInputChange(event: Event, property: rt): void {
    const value = (event.target as HTMLInputElement).value;

    // Dynamically update the specified property
    if (property === 'w') {
      this.resizeWidth.set(Number(value));
    } else if (property === 'h') {
      this.resizeHeight.set(Number(value));
    }
  }

  async editImage() {
    try {
      let res = await invoke<Uint8Array>('edit_image', {
        params: { resize: [this.resizeWidth(), this.resizeHeight()] },
      });
      const base64String = btoa(
        new Uint8Array(res).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );

      const dataUrl = `data:image/png;base64,${base64String}`;

      this.imagePath.set(dataUrl);
    } catch (error) {
      console.log('error importing image: ' + error);
    }
  }
  async importImage() {
    this.dbg.set('1');
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }],
        title: 'Pick Image',
      });
      this.dbg.set('2');
      if (selectedPath != null) {
        // const fileContent = await readFile(selectedPath);
        // const dataUrl = `data:image/png;base64,${fileContent}`;
        // this.imagePath.set(dataUrl);
        this.dbg.set('3');
        const fileContent = await readFile(selectedPath);
        this.dbg.set('4');
        // const appDataDirPath = await appDataDir();
        // const fileName = selectedPath.split('/').pop(); // Extract the file name
        // this.dbg.set('5');
        // const filePath = await join(appDataDirPath, fileName!);
        // await writeFile(filePath, fileContent);
        // this.dbg.set('6');
        // const assetUrl = convertFileSrc(filePath);
        // this.dbg.set('7');

        let res = await invoke<Uint8Array | null>('import_image', {
          imageData: fileContent,
        });

        if (res !== null) {
          //? Convert binary data to Base64
          const base64String = btoa(
            new Uint8Array(res).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          );

          const dataUrl = `data:image/png;base64,${base64String}`;

          this.imagePath.set(dataUrl);
        } else {
          this.imagePath.set(null);
        }

        this.dbg.set('8');
      }
      this.dbg.set('9');
    } catch (error) {
      this.dbg.set('10: ' + error);
      console.log('error importing image: ' + error);
    }
  }

  constructor(private fileService: ImageService) {
    invoke<ImageState>('get_image').then((file) => {
      if (file.edit_image !== null || file.edit_image !== undefined) {
        let a = file.edit_image;
        const base64String = btoa(
          new Uint8Array(file.edit_image!).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        const dataUrl = `data:image/png;base64,${base64String}`;

        this.imagePath.set(dataUrl);
      } else {
        this.imagePath.set(null);
      }
    });
  }
}

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [NgIf, AppbarComponent],
//   template: `
//     <app-appbar />
//     <div class="flex flex-col items-center p-4">
//       <div class="mb-4">
//         <button
//           class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           (click)="uploadImage()"
//         >
//           Upload Image
//         </button>
//         <button
//           class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 ml-2"
//           (click)="cropImage()"
//         >
//           Crop Image
//         </button>
//         <button
//           class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
//           (click)="saveImage()"
//         >
//           Save Image
//         </button>
//       </div>
//       <div class="flex w-full h-[500px]">
//         <div class="flex-1 bg-gray-100">
//           <img
//             *ngIf="originalImageSrc"
//             [src]="originalImageSrc"
//             alt="Original Image"
//             class="w-full h-full object-contain"
//           />
//         </div>
//         <div class="flex-1 bg-gray-200">
//           <img
//             *ngIf="editedImageSrc"
//             [src]="editedImageSrc"
//             alt="Edited Image"
//             class="w-full h-full object-contain"
//           />
//         </div>
//       </div>
//     </div>
//   `,
//   styles: ``,
// })
// export class HomeComponent {
//   imageData = signal<string | null>(null);
//   imagePath = signal<string | null>(null);
//   processing = signal<boolean>(false);

//   async importImage() {}

//   originalImageSrc = '';
//   editedImageSrc = '';

//   constructor(private fileService: ImageService) {}

//   async uploadImage() {
//     const tempPath = await this.fileService.uploadImage();
//     if (tempPath) {
//       this.originalImageSrc = tempPath;
//     }
//   }

//   async cropImage() {
//     if (this.originalImageSrc) {
//       const croppedPath = await this.fileService.cropImage(
//         this.originalImageSrc,
//         50,
//         50,
//         200,
//         200,
//       );
//       this.editedImageSrc = croppedPath;
//     }
//   }

//   async saveImage() {
//     await this.fileService.saveImage(this.editedImageSrc);
//   }
// }

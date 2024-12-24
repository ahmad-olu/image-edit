import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import {
  createManipulationParams,
  createToggleAndDescription,
  DataField,
  ImageState,
  ManipulationParams,
  ManipulationType,
  prepareForSerialization,
  ToggleAndDescription,
  ToggleAndDescriptionSingle,
} from '../model/manipulation-params';
import { readFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  originalImagePath = signal<string | null>(null);
  editedImagePath = signal<string | null>(null);
  processing = signal<boolean>(false);

  params = signal<ManipulationParams>(createManipulationParams());
  toggleAndDescription = signal<ToggleAndDescription>(
    createToggleAndDescription(),
  );

  async importImage() {
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }],
        title: 'Pick Image',
      });

      if (selectedPath != null) {
        const fileContent = await readFile(selectedPath);

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

          this.editedImagePath.set(dataUrl);
        } else {
          this.editedImagePath.set(null);
        }
      }
    } catch (error) {
      console.log('error importing image: ' + error);
    }
  }

  async getImage() {
    invoke<ImageState>('get_image').then((file) => {
      if (file.edit_image !== null || file.edit_image !== undefined) {
        const base64String = btoa(
          new Uint8Array(file.edit_image!).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        const dataUrl = `data:image/png;base64,${base64String}`;

        this.editedImagePath.set(dataUrl);
      } else {
        this.editedImagePath.set(null);
      }

      if (file.og_image !== null || file.og_image !== undefined) {
        const base64String = btoa(
          new Uint8Array(file.og_image!).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        const dataUrl = `data:image/png;base64,${base64String}`;

        this.originalImagePath.set(dataUrl);
      } else {
        this.originalImagePath.set(null);
      }
    });
  }

  onInputBoolChange(event: Event, manipulationType: ManipulationType): void {
    const value = (event.target as HTMLInputElement).checked;
    if (manipulationType === 'resize') {
      const resize = this.toggleAndDescription().resize;
      this.toggleAndDescription.set({
        ...this.toggleAndDescription(),
        resize: {
          ...resize,
          toggle: value,
        },
      });
    }
  }

  toggleDescription(manipulationType: ManipulationType): void {
    if (manipulationType === 'resize') {
      const resize = this.toggleAndDescription().resize;
      this.toggleAndDescription.set({
        ...this.toggleAndDescription(),
        resize: {
          ...resize,
          showDescription: resize.showDescription === true ? false : true,
        },
      });
    }
  }

  onNumberValue(manipulationType: ManipulationType, field: DataField): number {
    if (manipulationType === 'resize') {
      if (field === 'width') {
        return this.params().resize?.[0] ?? 0;
      } else if (field === 'height') {
        return this.params().resize?.[1] ?? 0;
      }
    }
    return 0;
  }

  onToggleAndDescription(
    manipulationType: ManipulationType,
  ): ToggleAndDescriptionSingle {
    if (manipulationType === 'resize') {
      return this.toggleAndDescription().resize;
    }
    return {
      toggle: false,
      showDescription: false,
      description: '',
    };
  }

  // Generic function to handle changes
  onInputChange(
    event: Event,
    manipulationType: ManipulationType,
    field: DataField,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    const resize = this.params().resize ?? [0, 0];

    if (manipulationType === 'resize') {
      if (field === 'width') {
        this.params.set({
          ...this.params(),
          resize: [Number(value), resize[1]],
        });
      } else if (field === 'height') {
        this.params.set({
          ...this.params(),
          resize: [resize[0], Number(value)],
        });
      }
    }
  }

  async editImage() {
    const filteredParams = prepareForSerialization(
      this.params(),
      this.toggleAndDescription(),
    );

    try {
      let res = await invoke<Uint8Array>('edit_image', {
        params: filteredParams,
      });
      const base64String = btoa(
        new Uint8Array(res).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );

      const dataUrl = `data:image/png;base64,${base64String}`;

      this.editedImagePath.set(dataUrl);
    } catch (error) {
      console.log('error importing image: ' + error);
    }
  }

  async saveImage(editedFilePath: string): Promise<void> {
    // const savePath = await save({
    //   defaultPath: 'edited-image.png',
    // });
    // if (savePath) {
    //   await invoke('save_image', { editedFilePath, savePath });
    // }
  }

  constructor() {}
}

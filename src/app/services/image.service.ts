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
import { open, save } from '@tauri-apps/plugin-dialog';

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
    const toggleAndDescription = this.toggleAndDescription();

    if (manipulationType in toggleAndDescription) {
      this.toggleAndDescription.set({
        ...toggleAndDescription,
        [manipulationType]: {
          ...toggleAndDescription[manipulationType],
          toggle: value,
        },
      });
    }
  }

  toggleDescription(manipulationType: ManipulationType): void {
    const toggleAndDescription = this.toggleAndDescription();

    if (manipulationType in toggleAndDescription) {
      this.toggleAndDescription.set({
        ...toggleAndDescription,
        [manipulationType]: {
          ...toggleAndDescription[manipulationType],
          showDescription:
            !toggleAndDescription[manipulationType].showDescription,
        },
      });
    }
  }

  onNumberValue(manipulationType: ManipulationType, field: DataField): number {
    const resizeFieldIndexMap: Record<DataField, number> = {
      width: 0,
      height: 1,
      x: 2, // should not get here
      y: 3, // should not get here
    };

    const cropFieldIndexMap: Record<DataField, number> = {
      x: 0,
      y: 1,
      width: 2,
      height: 3,
    };

    if (manipulationType === 'resize' && field in resizeFieldIndexMap) {
      return this.params().resize?.[resizeFieldIndexMap[field]] ?? 0;
    }

    if (manipulationType === 'crop' && field in cropFieldIndexMap) {
      return this.params().crop?.[cropFieldIndexMap[field]] ?? 0;
    }

    return 0;
  }
  onBooleanValue(manipulationType: ManipulationType): boolean {
    if (manipulationType === 'grayscale') {
      return this.params().grayscale ?? false;
    }

    if (manipulationType === 'invert') {
      return this.params().invert ?? false;
    }

    return false;
  }

  onToggleAndDescription(
    manipulationType: ManipulationType,
  ): ToggleAndDescriptionSingle {
    const toggleAndDescription = this.toggleAndDescription();

    return (
      toggleAndDescription[manipulationType] ?? {
        toggle: false,
        showDescription: false,
        description: '',
      }
    );
  }

  // Generic function to handle changes
  onInputChange(
    event: Event,
    manipulationType: ManipulationType,
    field?: DataField,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    const checked = (event.target as HTMLInputElement).checked;
    if (manipulationType === 'resize') {
      const [currentWidth, currentHeight] = this.params().resize ?? [0, 0];
      const updatedResize: [number, number] =
        field === 'width'
          ? [Number(value), currentHeight]
          : [currentWidth, Number(value)];

      this.params.set({
        ...this.params(),
        resize: updatedResize,
      });
    } else if (manipulationType === 'crop') {
      const crop = this.params().crop ?? [0, 0, 0, 0];

      const fieldIndexMap: Record<string, number> = {
        x: 0,
        y: 1,
        width: 2,
        height: 3,
      };

      const index = fieldIndexMap[field!];
      if (index !== undefined) {
        const updatedCrop: [number, number, number, number] = [...crop];
        updatedCrop[index] = Number(value);

        this.params.set({
          ...this.params(),
          crop: updatedCrop,
        });
      }
    } else if (manipulationType === 'grayscale') {
      this.params.set({
        ...this.params(),
        grayscale: checked,
      });
    }
  }

  async editImage() {
    this.processing.set(true);
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
      this.processing.set(false);
    } catch (error) {
      console.log('error importing image: ' + error);
      this.processing.set(false);
    }
  }

  async saveImage(): Promise<void> {
    //todo ! make this work
    const savePath = await save({
      defaultPath: 'edited-image.png',
      //   filters: [
      //     {
      //       name: 'edited-image',
      //       extensions: ['png', 'jpeg'],
      //     },
      //   ],
    });
    if (savePath) {
      await invoke('save_image', { path: savePath });
    }
  }

  constructor() {}
}

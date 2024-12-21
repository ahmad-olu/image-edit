import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import {
  createManipulationParams,
  createToggleAndDescription,
  ManipulationParams,
  ManipulationType,
  prepareForSerialization,
  ToggleAndDescription,
} from '../model/manipulation-params';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  params = signal<ManipulationParams>(createManipulationParams());
  toggleAndDescription = signal<ToggleAndDescription>(
    createToggleAndDescription(),
  );

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

  // Generic function to handle changes
  onInputChange(
    event: Event,
    manipulationType: ManipulationType,
    index: number,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    const resize = this.params().resize ?? [0, 0];

    if (manipulationType === 'resize') {
      if (index === 0) {
        this.params.set({
          ...this.params(),
          resize: [Number(value), resize[1]],
        });
      } else if (index === 1) {
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

      //this.imagePath.set(dataUrl);
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

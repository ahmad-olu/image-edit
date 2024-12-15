import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  async uploadImage(): Promise<string | undefined> {
    // const filePath = await open({
    //   filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] }],
    // });
    // if (filePath) {
    //   return invoke('move_to_temp', { filePath });
    // }
    return undefined;
  }

  async cropImage(
    filePath: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<string> {
    return invoke('crop_image', { filePath, x, y, width, height });
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

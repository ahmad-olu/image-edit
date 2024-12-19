export interface ManipulationParams {
  resize?: [number, number];
  crop?: [number, number, number, number];
  grayscale?: boolean;
  invert?: boolean;
}

export function createManipulationParams(
  params: Partial<ManipulationParams> = {},
): ManipulationParams {
  return {
    resize: [400, 400], // Default size
    crop: [0, 0, 100, 100], // Default crop
    grayscale: false,
    invert: false,
    ...params, // Override defaults with provided values
  };
}

// type ManipulationType = 'resize' | 'crop' | 'grayscale' | 'invert';

// onInputChange(event: Event, property: ManipulationType, field?: string): void {
//   const value = (event.target as HTMLInputElement).value;

//   // Handle dynamic updates
//   if (property === 'resize') {
//     if (field === 'w') {
//       this.resizeWidth = Number(value);
//     } else if (field === 'h') {
//       this.resizeHeight = Number(value);
//     }
//   } else if (property === 'crop') {
//     // Assume crop has fields x, y, width, height
//     if (field === 'x') {
//       this.cropX = Number(value);
//     } else if (field === 'y') {
//       this.cropY = Number(value);
//     } else if (field === 'width') {
//       this.cropWidth = Number(value);
//     } else if (field === 'height') {
//       this.cropHeight = Number(value);
//     }
//   } else if (property === 'grayscale') {
//     this.grayscale = value === 'true'; // Handle as boolean toggle
//   } else if (property === 'invert') {
//     this.invert = value === 'true'; // Handle as boolean toggle
//   }
// }

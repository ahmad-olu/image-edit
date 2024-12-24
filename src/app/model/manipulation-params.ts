export type ImageState = {
  og_image: Uint8Array | null;
  edit_image: Uint8Array | null;
};

export interface ManipulationParams {
  resize?: [number, number];
  crop?: [number, number, number, number];
  grayscale?: boolean;
  invert?: boolean;
}

export interface ToggleAndDescriptionSingle {
  toggle: boolean;
  showDescription: boolean;
  description: string;
}
export interface ToggleAndDescription {
  resize: ToggleAndDescriptionSingle;
  crop: ToggleAndDescriptionSingle;
  grayscale: ToggleAndDescriptionSingle;
  invert: ToggleAndDescriptionSingle;
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

function createToggleAndDescriptionSingle(
  params: string,
): ToggleAndDescriptionSingle {
  return {
    toggle: false,
    showDescription: false,
    description: params,
  };
}

export function createToggleAndDescription(
  params: Partial<ToggleAndDescription> = {},
): ToggleAndDescription {
  return {
    resize: createToggleAndDescriptionSingle(`
        <p>Enter the desired dimensions for the image resize:</p>
        <ul class="list-disc pl-5">
          <li><b>Width:</b> The width in pixels for the resized image.</li>
          <li><b>Height:</b> The height in pixels for the resized image.</li>
        </ul>
        `),
    crop: createToggleAndDescriptionSingle(``),
    grayscale: createToggleAndDescriptionSingle(''),
    invert: createToggleAndDescriptionSingle(''),
    ...params, // Override defaults with provided values
  };
}

export type ManipulationType = 'resize' | 'crop' | 'grayscale' | 'invert';
export type DataField = 'width' | 'height' | 'x' | 'y';

export function onInputChange(
  event: Event,
  params: ManipulationParams,
  property: ManipulationType,
  field?: string,
) {
  const value = (event.target as HTMLInputElement).value;
  // Handle dynamic updates
  if (property === 'resize') {
    if (field === 'w') {
      params.resize![0] = Number(value);
    } else if (field === 'h') {
      params.resize![1] = Number(value);
    }
  } else if (property === 'crop') {
    // Assume crop has fields x, y, width, height
    if (field === 'x') {
      params.crop![0] = Number(value);
    } else if (field === 'y') {
      params.crop![1] = Number(value);
    } else if (field === 'width') {
      params.crop![2] = Number(value);
    } else if (field === 'height') {
      params.crop![3] = Number(value);
    }
  } else if (property === 'grayscale') {
    params.grayscale = value === 'true'; // Handle as boolean toggle
  } else if (property === 'invert') {
    params.invert = value === 'true'; // Handle as boolean toggle
  }
}

export function prepareForSerialization(
  params: ManipulationParams,
  toggleState: ToggleAndDescription,
): Partial<ManipulationParams> {
  const serializedParams: Partial<ManipulationParams> = {};

  if (toggleState.resize.toggle) {
    serializedParams.resize = params.resize;
  }
  if (toggleState.crop.toggle) {
    serializedParams.crop = params.crop;
  }
  if (toggleState.grayscale.toggle) {
    serializedParams.grayscale = params.grayscale;
  }
  if (toggleState.invert.toggle) {
    serializedParams.invert = params.invert;
  }

  return serializedParams;
}

import { Component, inject, input, signal } from '@angular/core';
import {
  DataField,
  ManipulationType,
  ToggleAndDescriptionSingle,
} from '../../model/manipulation-params';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ImageService } from '../../services/image.service';
import { forwardRef } from '@angular/core';

@Component({
  selector: 'app-edit-bar-single',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    forwardRef(() => EditBarNumberInputButtonComponent),
    forwardRef(() => EditBarCheckBoxInputButtonComponent),
    TitleCasePipe,
  ],
  template: `
    <div class="">
      <div
        class="mb-4 ms-4 flex items-center space-x-2"
        [class]="onToggleAndDescription().toggle ? '' : 'opacity-40'"
      >
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            [value]="onToggleAndDescription().toggle"
            (change)="this.onInputBoolChange($event)"
            class="sr-only peer"
          />
          <div
            class="relative  w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
          ></div>
        </label>

        <h6 class="text-gray-700">{{ manipulationType() | titlecase }}:</h6>
        <div *ngFor="let val of inputButtonVal(); track: val">
          @if (val.dataField != null || val.dataField != undefined) {
            <app-edit-bar-number-input-button
              [dataField]="val.dataField!"
              [manipulationType]="val.manipulationType"
            />
          } @else {
            <app-edit-bar-checkbox-input-button
              [manipulationType]="val.manipulationType"
            />
          }
        </div>
        <!-- @for (val of inputButtonVal(); track val) { } -->
        <button
          class="ml-auto cursor-pointer text-blue-500"
          (click)="this.imageService.toggleDescription(manipulationType())"
          [disabled]="!onToggleAndDescription().toggle"
          title="Toggle Description"
        >
          show
        </button>
      </div>
      <div
        *ngIf="onToggleAndDescription().showDescription"
        class="text-sm text-gray-600"
      >
        <div [innerHTML]="onToggleAndDescription().description"></div>
      </div>
    </div>
  `,
  styles: ``,
})
export class EditBarSingleComponent {
  manipulationType = input.required<ManipulationType>();
  inputButtonVal = input.required<InputButtonValueModel[]>();

  //  toggleAndDescription = input.required<boolean>();
  // toggleDescriptionSingle = input.required<ToggleAndDescriptionSingle>();

  imageService = inject(ImageService);

  onInputBoolChange(event: Event): void {
    this.imageService.onInputBoolChange(event, this.manipulationType());
  }

  onToggleAndDescription(): ToggleAndDescriptionSingle {
    return this.imageService.onToggleAndDescription(this.manipulationType());
  }
}

type InputButtonValueModel = {
  dataField?: DataField;
  manipulationType: ManipulationType;
};

@Component({
  selector: 'app-edit-bar',
  standalone: true,
  imports: [EditBarSingleComponent],
  template: `
    <app-edit-bar-single
      manipulationType="resize"
      [inputButtonVal]="[
        {
          dataField: 'width',
          manipulationType: 'resize',
        },
        {
          dataField: 'height',
          manipulationType: 'resize',
        },
      ]"
    />
    <app-edit-bar-single
      manipulationType="crop"
      [inputButtonVal]="[
        {
          dataField: 'x',
          manipulationType: 'crop',
        },
        {
          dataField: 'y',
          manipulationType: 'crop',
        },
        {
          dataField: 'width',
          manipulationType: 'crop',
        },
        {
          dataField: 'height',
          manipulationType: 'crop',
        },
      ]"
    />
    <app-edit-bar-single
      manipulationType="grayscale"
      [inputButtonVal]="[
        {
          manipulationType: 'grayscale',
        },
      ]"
    />
    <!-- <p>{{ dbg() }} : {{ this.toggleAndDescription().resize.toggle }}</p> -->
  `,
  styles: ``,
})
export class EditBarComponent {
  //   @ViewChild(EditBarSingleComponent) editBarSingle!: EditBarSingleComponent;

  dbg = signal<string>('0');
}

@Component({
  selector: 'app-edit-bar-number-input-button',
  standalone: true,
  imports: [],
  template: `
    <input
      type="number"
      [value]="onNumberValue()"
      [disabled]="!onToggleAndDescription().toggle"
      (change)="this.onInputChange($event)"
      [placeholder]="dataField()"
      class="p-2 border rounded w-20"
    />
  `,
  styles: ``,
})
export class EditBarNumberInputButtonComponent {
  dataField = input.required<DataField>();
  manipulationType = input.required<ManipulationType>();
  //  value = input.required<number>();

  imageService = inject(ImageService);

  onInputChange(event: Event): void {
    this.imageService.onInputChange(
      event,
      this.manipulationType(),
      this.dataField(),
    );
  }

  onNumberValue(): number {
    return this.imageService.onNumberValue(
      this.manipulationType(),
      this.dataField(),
    );
  }

  onToggleAndDescription(): ToggleAndDescriptionSingle {
    return this.imageService.onToggleAndDescription(this.manipulationType());
  }
}

@Component({
  selector: 'app-edit-bar-checkbox-input-button',
  standalone: true,
  imports: [],
  template: `
    <label class="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        [disabled]="!onToggleAndDescription().toggle"
        (change)="this.onInputChange($event)"
        [placeholder]="manipulationType()"
        class="sr-only peer"
      />
      <div
        class="relative  w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
    </label>
  `,
  styles: ``,
})
export class EditBarCheckBoxInputButtonComponent {
  manipulationType = input.required<ManipulationType>();
  //  value = input.required<number>();

  imageService = inject(ImageService);

  onInputChange(event: Event): void {
    this.imageService.onInputChange(event, this.manipulationType());
  }

  onBooleanValue(): boolean {
    return this.imageService.onBooleanValue(this.manipulationType());
  }

  onToggleAndDescription(): ToggleAndDescriptionSingle {
    return this.imageService.onToggleAndDescription(this.manipulationType());
  }
}

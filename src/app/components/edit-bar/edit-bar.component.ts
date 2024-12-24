import {
  Component,
  inject,
  Input,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import {
  createManipulationParams,
  createToggleAndDescription,
  DataField,
  ManipulationParams,
  ManipulationType,
  ToggleAndDescription,
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
    TitleCasePipe,
  ],
  template: `
    <div class="">
      <div
        class="mb-4 ms-4 flex items-center space-x-2"
        [class]="onToggleAndDescription().toggle ? '' : 'opacity-40'"
      >
        <input
          type="checkbox"
          id="enableResize"
          [value]="onToggleAndDescription().toggle"
          (change)="this.onInputBoolChange($event)"
          class="mr-2"
        />
        <h6 class="text-gray-700">{{ manipulationType() | titlecase }}:</h6>
        <div *ngFor="let val of inputButtonVal(); track: val">
          <app-edit-bar-number-input-button
            [dataField]="val.dataField"
            [manipulationType]="val.manipulationType"
          />
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
  inputButtonVal = input.required<
    {
      dataField: DataField;
      manipulationType: ManipulationType;
    }[]
  >();

  //  toggleAndDescription = input.required<boolean>();
  // toggleDescriptionSingle = input.required<ToggleAndDescriptionSingle>();

  imageService = inject(ImageService);

  onInputBoolChange(event: Event): void {
    this.imageService.onInputBoolChange(event, this.manipulationType());
  }

  onToggleAndDescription(): ToggleAndDescriptionSingle {
    return this.imageService.onToggleAndDescription('resize');
  }
}

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
    return this.imageService.onToggleAndDescription('resize');
  }

  toggleDescription(): void {
    this.imageService.toggleDescription(this.manipulationType());
  }

  onInputBoolChange(event: Event): void {
    this.imageService.onInputBoolChange(event, this.manipulationType());
  }
}

// @Component({
//   selector: 'app-edit-bar-number-input-button',
//   standalone: true,
//   imports: [],
//   template: ``,
//   styles: ``,
// })
// export class EditBarNumberInputButtonComponent {}

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
  ManipulationParams,
  ManipulationType,
  ToggleAndDescription,
  ToggleAndDescriptionSingle,
} from '../../model/manipulation-params';
import { NgFor, NgIf } from '@angular/common';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-edit-bar-single',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="">
      <div
        class="mb-4 ms-4 flex items-center space-x-2"
        [class]="toggleAndDescription() ? '' : 'opacity-40'"
      >
        <input
          type="checkbox"
          id="enableResize"
          [value]="toggleAndDescription()"
          (change)="
            this.imageService.onInputBoolChange($event, manipulationType())
          "
          class="mr-2"
        />
        <h6 class="text-gray-700">Resize:</h6>

        <div *ngFor="let num of numberButton(); let i = index">
          <input
            type="number"
            [value]="num"
            [disabled]="!toggleAndDescription()"
            (change)="
              this.imageService.onInputChange($event, manipulationType(), i)
            "
            placeholder="Width"
            class="p-2 border rounded w-20"
          />
        </div>

        <!-- @for (num of numberButton(); track num) {
          <input
            type="number"
            [value]="num"
            [disabled]="!toggleAndDescription()"
            (change)="
              this.imageService.onInputChange(
                $event,
                manipulationType(),
                'width'
              )
            "
            placeholder="Width"
            class="p-2 border rounded w-20"
          />
        } -->

        <!-- <input
          type="number"
          [value]="this.params().resize?.[1]"
          (change)="onInputChange($event, 'height')"
          [disabled]="!toggleAndDescription().resize.toggle"
          placeholder="Height"
          class="p-2 border rounded w-20"
        /> -->

        <button
          class="ml-auto cursor-pointer text-blue-500"
          (click)="this.imageService.toggleDescription(manipulationType())"
          [disabled]="!toggleAndDescription()"
          title="Toggle Description"
        >
          show
        </button>
      </div>
      <div
        *ngIf="toggleDescriptionSingle().showDescription"
        class="text-sm text-gray-600"
      >
        <div [innerHTML]="toggleDescriptionSingle().description"></div>
      </div>
    </div>
  `,
  styles: ``,
})
export class EditBarSingleComponent {
  manipulationType = input.required<ManipulationType>();
  numberButton = input<number[]>();
  toggleAndDescription = input.required<boolean>();
  toggleDescriptionSingle = input.required<ToggleAndDescriptionSingle>();

  imageService = inject(ImageService);
}

@Component({
  selector: 'app-edit-bar',
  standalone: true,
  imports: [EditBarSingleComponent],
  template: `
    <app-edit-bar-single
      manipulationType="resize"
      [numberButton]="this.imageService.params().resize"
      [toggleAndDescription]="
        this.imageService.toggleAndDescription().resize.toggle
      "
      [toggleDescriptionSingle]="
        this.imageService.toggleAndDescription().resize
      "
    />
    <!-- <p>{{ dbg() }} : {{ this.toggleAndDescription().resize.toggle }}</p> -->
  `,
  styles: ``,
})
export class EditBarComponent {
  //   @ViewChild(EditBarSingleComponent) editBarSingle!: EditBarSingleComponent;

  imageService = inject(ImageService);

  dbg = signal<string>('0');
}

// @Component({
//   selector: 'app-edit-bar-number-input-button',
//   standalone: true,
//   imports: [],
//   template: ``,
//   styles: ``,
// })
// export class EditBarNumberInputButtonComponent {}

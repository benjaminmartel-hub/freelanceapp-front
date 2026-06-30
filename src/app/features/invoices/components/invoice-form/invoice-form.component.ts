import { DecimalPipe, NgIf } from '@angular/common';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { InvoiceCreateRequest, InvoiceDetailResponse } from '../../../../core/models/invoice.model';
import { Mission } from '../../../../core/models/mission.model';

type InvoiceFormGroup = FormGroup<{
  missionId: FormControl<number | null>;
  issueDate: FormControl<Date | null>;
  dueDate: FormControl<Date | null>;
  totalHt: FormControl<number | null>;
  vatRate: FormControl<number | null>;
}>;

@Component({
  selector: 'app-invoice-form',
  imports: [
    NgIf,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly invoice = input<InvoiceDetailResponse | null>(null);
  readonly formKey = input(0);
  readonly missions = input<Mission[]>([]);
  readonly isSaving = input(false);
  readonly submitLabel = input('Enregistrer');

  readonly save = output<InvoiceCreateRequest>();
  readonly cancel = output<void>();

  readonly invoiceForm: InvoiceFormGroup = this.formBuilder.group({
    missionId: this.formBuilder.control<number | null>(null, Validators.required),
    issueDate: this.formBuilder.control<Date | null>(null, Validators.required),
    dueDate: this.formBuilder.control<Date | null>(null, Validators.required),
    totalHt: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    vatRate: this.formBuilder.control<number | null>(20, [Validators.required, Validators.min(0)])
  });

  readonly missionOptions = computed(() =>
    this.missions().map((mission) => ({
      label: `${mission.title} - ${mission.clientName}`,
      value: mission.id
    }))
  );

  constructor() {
    effect(() => {
      this.formKey();
      const invoice = this.invoice();
      if (!invoice) {
        this.invoiceForm.reset({
          missionId: null,
          issueDate: null,
          dueDate: null,
          totalHt: null,
          vatRate: 20
        });
        return;
      }

      this.invoiceForm.reset({
        missionId: invoice.mission.id,
        issueDate: this.toDate(invoice.issueDate),
        dueDate: this.toDate(invoice.dueDate),
        totalHt: invoice.totalHt,
        vatRate: invoice.vatRate
      });
    });
  }

  protected onMissionInput(missionId: number | null | undefined): void {
    this.invoiceForm.controls.missionId.setValue(missionId ?? null, { emitEvent: false });
  }

  totalTtc(): number {
    const value = this.invoiceForm.getRawValue();
    if (typeof value.totalHt !== 'number' || typeof value.vatRate !== 'number') {
      return 0;
    }

    return Math.round(value.totalHt * (1 + value.vatRate / 100) * 100) / 100;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const value = this.invoiceForm.getRawValue();
    if (!value.missionId || !value.issueDate || !value.dueDate || value.totalHt == null || value.vatRate == null) {
      return;
    }

    this.save.emit({
      missionId: value.missionId,
      issueDate: this.formatDate(value.issueDate),
      dueDate: this.formatDate(value.dueDate),
      totalHt: value.totalHt,
      vatRate: value.vatRate,
      totalTtc: this.totalTtc()
    });
  }

  private toDate(date: string): Date {
    return new Date(`${date}T00:00:00`);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

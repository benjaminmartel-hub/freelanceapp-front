import { DecimalPipe, NgIf } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Mission, MissionStatus } from '../../../../core/models/mission.model';

type MissionFormGroup = FormGroup<{
  title: FormControl<string>;
  clientName: FormControl<string>;
  clientContactEmail: FormControl<string>;
  dailyRate: FormControl<number>;
  expectedDuration: FormControl<number>;
  billingType: FormControl<string>;
  status: FormControl<MissionStatus>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  internalNotes: FormControl<string>;
}>;

@Component({
  selector: 'app-mission-form',
  imports: [
    NgIf,
    DecimalPipe,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule
  ],
  templateUrl: './mission-form.component.html',
  styleUrl: './mission-form.component.scss'
})
export class MissionFormComponent {
  readonly mission = input<Mission | null>(null);
  readonly isSaving = input(false);
  readonly submitLabel = input('Enregistrer');

  readonly save = output<Mission>();
  readonly cancel = output<void>();

  readonly statusOptions = [
    { label: 'Prospect', value: 'PROSPECT' as MissionStatus },
    { label: 'En cours', value: 'ONGOING' as MissionStatus },
    { label: 'Terminee', value: 'FINISHED' as MissionStatus }
  ];
  readonly billingTypeOptions = [
    { label: 'TJM', value: 'TJM' },
    { label: 'Forfait', value: 'FORFAIT' }
  ];

  readonly form: MissionFormGroup = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    clientName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    clientContactEmail: new FormControl('', { nonNullable: true }),
    dailyRate: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    expectedDuration: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    billingType: new FormControl('TJM', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<MissionStatus>('PROSPECT', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    startDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    endDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    internalNotes: new FormControl('', { nonNullable: true })
  });

  constructor() {
    effect(() => {
      const mission = this.mission();
      if (!mission) {
      this.form.reset({
        title: '',
        clientName: '',
        clientContactEmail: '',
        dailyRate: 0,
        expectedDuration: 0,
        billingType: 'TJM',
        status: 'PROSPECT',
        startDate: null,
        endDate: null,
        internalNotes: ''
      });
      return;
    }

    this.form.reset({
      title: mission.title ?? '',
      clientName: mission.clientName,
      clientContactEmail: mission.clientContactEmail ?? '',
      dailyRate: mission.dailyRate,
      expectedDuration: mission.expectedDuration ?? 0,
      billingType: mission.billingType ?? 'TJM',
      status: mission.status,
      startDate: mission.startDate,
      endDate: mission.endDate,
      internalNotes: mission.internalNotes ?? ''
    });
  });

  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.startDate || !value.endDate) {
      return;
    }

    this.save.emit({
      id: this.mission()?.id,
      title: value.title,
      clientName: value.clientName,
      clientContactEmail: value.clientContactEmail,
      dailyRate: value.dailyRate,
      expectedDuration: value.expectedDuration,
      billingType: value.billingType,
      status: value.status,
      startDate: value.startDate,
      endDate: value.endDate,
      internalNotes: value.internalNotes
    });
  }

  totalBudgetEstimate(): number {
    const value = this.form.getRawValue();
    if (!value.dailyRate || !value.expectedDuration) {
      return 0;
    }

    return value.dailyRate * value.expectedDuration;
  }
}

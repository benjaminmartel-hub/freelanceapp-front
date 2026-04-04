import { DecimalPipe, NgIf } from '@angular/common';
import { Component, inject, effect, input, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { Client } from '../../../../core/models/client.model';
import { Mission, MissionStatus } from '../../../../core/models/mission.model';

type MissionFormGroup = FormGroup<{
  title: FormControl<string>;
  clientName: FormControl<string>;
  clientContactEmail: FormControl<string>;
  dailyRate: FormControl<number | null>;
  expectedDuration: FormControl<number | null>;
  billingType: FormControl<string>;
  status: FormControl<MissionStatus>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  internalNotes: FormControl<string>;
  currency: FormControl<string>;
}>;

@Component({
  selector: 'app-mission-form',
  imports: [
    NgIf,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './mission-form.component.html',
  styleUrl: './mission-form.component.scss'
})
export class MissionFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly mission = input<Mission | null>(null);
  readonly formKey = input(0);
  readonly clients = input<Client[]>([]);
  readonly isSaving = input(false);
  readonly submitLabel = input('Enregistrer');

  readonly save = output<Mission>();
  readonly cancel = output<void>();

  readonly statusOptions = [
    { label: 'Prospect', value: 'PROSPECT' as MissionStatus },
    { label: 'En cours', value: 'ONGOING' as MissionStatus },
    { label: 'Terminee', value: 'FINISHED' as MissionStatus },
    { label: 'Annulee', value: 'CANCELLED' as MissionStatus }
  ];
  readonly billingTypeOptions = [
    { label: 'TJM', value: 'TJM' },
    { label: 'Forfait', value: 'FORFAIT' }
  ];

  readonly missionForm: MissionFormGroup = this.formBuilder.group({
    title: this.formBuilder.nonNullable.control('', Validators.required),
    clientName: this.formBuilder.nonNullable.control('', Validators.required),
    clientContactEmail: this.formBuilder.nonNullable.control(''),
    dailyRate: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    expectedDuration: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    billingType: this.formBuilder.nonNullable.control('TJM', Validators.required),
    status: this.formBuilder.nonNullable.control<MissionStatus>('PROSPECT', Validators.required),
    startDate: this.formBuilder.control<Date | null>(null, Validators.required),
    endDate: this.formBuilder.control<Date | null>(null, Validators.required),
    internalNotes: this.formBuilder.nonNullable.control(''),
    currency: this.formBuilder.nonNullable.control('EUR', Validators.required)
  });

  private selectedClientId: number | null = null;
  constructor() {
    effect(() => {
      this.formKey();
      const mission = this.mission();
      if (!mission) {
        this.missionForm.reset({
          title: '',
          clientName: '',
          clientContactEmail: '',
          dailyRate: null,
          expectedDuration: null,
          billingType: 'TJM',
          status: 'PROSPECT',
          startDate: null,
          endDate: null,
          internalNotes: '',
          currency: 'EUR'
        });
        this.selectedClientId = null;
        return;
      }

      this.missionForm.reset({
        title: mission.title ?? '',
        clientName: mission.clientName,
        clientContactEmail: mission.clientContactEmail ?? '',
        dailyRate: mission.dailyRate ?? null,
        expectedDuration: mission.expectedDuration ?? null,
        billingType: mission.billingType ?? 'TJM',
        status: mission.status,
        startDate: mission.startDate,
        endDate: mission.endDate,
        internalNotes: mission.internalNotes ?? '',
        currency: mission.currency ?? 'EUR'
      });
      this.selectedClientId = mission.clientId ?? null;
      this.syncClientSelection(mission.clientName, true);
    });

    effect(() => {
      this.syncClientSelection(this.missionForm.controls.clientName.value, true);
    });
  }

  protected onClientNameInput(clientName: string | null | undefined): void {
    const normalizedName = clientName?.trim() ?? '';
    this.missionForm.controls.clientName.setValue(normalizedName, { emitEvent: false });
    this.syncClientSelection(normalizedName, false);
  }

  protected onStatusInput(status: MissionStatus | null | undefined): void {
    if (!status) {
      return;
    }
    this.missionForm.controls.status.setValue(status, { emitEvent: false });
  }

  protected onBillingTypeInput(billingType: string | null | undefined): void {
    if (!billingType) {
      return;
    }
    this.missionForm.controls.billingType.setValue(billingType, { emitEvent: false });
  }

  private syncClientSelection(clientName: string | null | undefined, keepExistingEmail: boolean): void {
    const normalizedName = clientName?.trim() ?? '';
    if (!normalizedName) {
      if (!keepExistingEmail) {
        this.missionForm.controls.clientContactEmail.setValue('');
      }
      this.selectedClientId = null;
      return;
    }

    const clients = this.clients();
    if (!clients.length) {
      return;
    }

    const match = clients.find((client) => client.name === normalizedName);
    if (!match) {
      if (this.selectedClientId != null) {
        this.missionForm.controls.clientContactEmail.setValue('');
      }
      this.selectedClientId = null;
      return;
    }

    this.selectedClientId = match.id;
    if (!keepExistingEmail || !this.missionForm.controls.clientContactEmail.value) {
      this.missionForm.controls.clientContactEmail.setValue(match.contactEmail ?? '');
    }
  }

  onSubmit(): void {
    if (this.missionForm.invalid) {
      this.missionForm.markAllAsTouched();
      return;
    }

    const value = this.missionForm.getRawValue();
    if (!value.startDate || !value.endDate) {
      return;
    }

    this.save.emit({
      id: this.mission()?.id,
      title: value.title,
      clientName: value.clientName,
      clientId: this.selectedClientId,
      clientContactEmail: value.clientContactEmail,
      dailyRate: value.dailyRate ?? 0,
      expectedDuration: value.expectedDuration ?? null,
      billingType: value.billingType,
      status: value.status,
      startDate: value.startDate,
      endDate: value.endDate,
      internalNotes: value.internalNotes,
      currency: value.currency
    });
  }

  totalBudgetEstimate(): number {
    const value = this.missionForm.getRawValue();
    if (typeof value.dailyRate !== 'number' || typeof value.expectedDuration !== 'number') {
      return 0;
    }

    return value.dailyRate * value.expectedDuration;
  }
}

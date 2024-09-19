import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Reserva {
  id: number;
  date: string;
  time: string;
  seats: number;
  special_requirements: string;
  client_id: number;
  state: string; // Añadido el campo de estado
}

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {
  reservaForm: FormGroup;
  showForm = false;
  mostrarActivos = true;
  searchTerm = '';
  editingReserva: Reserva | null = null;

  reservas: Reserva[] = [];
  displayedColumns: string[] = ['id', 'date', 'time', 'seats', 'client_id', 'special_requirements', 'state', 'actions'];
  dataSource: MatTableDataSource<Reserva> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.reservaForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      seats: ['', [Validators.required, Validators.min(1)]],
      special_requirements: [''],
      client_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateDataSource();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingReserva = null;
      this.reservaForm.reset();
    }
  }

  onSubmit() {
    if (this.reservaForm.valid) {
      const newReserva: Reserva = { 
        ...this.reservaForm.value, 
        date: this.formatDate(this.reservaForm.value.date), 
        state: 'A' 
      };
      if (this.editingReserva) {
        const index = this.reservas.findIndex(r => r.id === this.editingReserva!.id);
        this.reservas[index] = { ...newReserva, id: this.editingReserva.id };
        this.editingReserva = null;
      } else {
        this.reservas.push({ ...newReserva, id: this.reservas.length + 1 });
      }
      this.updateDataSource();
      this.toggleForm();
    }
  }

  editReserva(reserva: Reserva) {
    this.editingReserva = reserva;
    this.reservaForm.setValue({
      date: this.formatDate(reserva.date),
      time: reserva.time,
      seats: reserva.seats,
      special_requirements: reserva.special_requirements,
      client_id: reserva.client_id
    });
    this.toggleForm();
  }

  deleteReserva(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea eliminar esta reserva?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.reservas.findIndex(reserva => reserva.id === id);
        if (index !== -1) {
          this.reservas[index].state = 'I';
          this.updateDataSource();
        }
      }
    });
  }

  restoreReserva(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea restaurar esta reserva?' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const index = this.reservas.findIndex(reserva => reserva.id === id);
        if (index !== -1) {
          this.reservas[index].state = 'A';
          this.updateDataSource();
        }
      }
    });
  }

  toggleReservas(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.updateDataSource();
  }

  applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filterPredicate = (reserva: Reserva, filter: string) => {
      const matchesFilter = this.filterReserva(reserva, filter);
      return matchesFilter;
    };
    this.dataSource.filter = filterValue;
  }

  updateDataSource() {
    this.dataSource.data = this.reservas.filter(reserva => this.mostrarActivos ? reserva.state === 'A' : reserva.state === 'I');
    this.applyFilter();
  }

  filterReserva(reserva: Reserva, filterValue: string): boolean {
    return (
      reserva.id.toString().includes(filterValue) ||
      reserva.date.toLowerCase().includes(filterValue) ||
      reserva.time.toLowerCase().includes(filterValue) ||
      reserva.seats.toString().includes(filterValue) ||
      reserva.client_id.toString().includes(filterValue) ||
      reserva.special_requirements.toLowerCase().includes(filterValue)
    );
  }

  formatDate(date: string): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
      month = '0' + month;
    if (day.length < 2) 
      day = '0' + day;

    return [year, month, day].join('-');
  }
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h1 mat-dialog-title>Confirmar</h1>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Aceptar</button>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

interface DialogData {
  message: string;
}

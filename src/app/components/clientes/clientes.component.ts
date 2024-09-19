import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

interface Cliente {
  id: number;
  names: string;
  last_names: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  birthdate: string;
  state: string;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clienteForm: FormGroup;
  showForm = false;
  mostrarActivos = true;
  searchTerm = '';
  editingCliente: Cliente | null = null;

  clientes: Cliente[] = [
    { id: 1, names: 'Juan', last_names: 'Perez', document_type: 'DNI', document_number: '12345678', email: 'juan@example.com', phone: '963258741', birthdate: '01/01/1990', state: 'A' },
    { id: 2, names: 'Maria', last_names: 'Gonzalez', document_type: 'CNE', document_number: '87654321', email: 'maria@example.com', phone: '987654321', birthdate: '02/02/1992', state: 'A' }
  ];
  displayedColumns: string[] = ['id', 'names', 'last_names', 'document_type', 'document_number', 'email', 'phone', 'birthdate', 'state', 'acciones'];
  dataSource: MatTableDataSource<Cliente> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.clienteForm = this.fb.group({
      names: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      last_names: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      document_type: ['', Validators.required],
      document_number: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      birthdate: ['', Validators.required],
      state: ['A']
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateDataSource();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingCliente = null;
      this.clienteForm.reset();
    }
  }

  onSubmit() {
    if (this.clienteForm.valid) {
      const newCliente: Cliente = {
        ...this.clienteForm.value,
        birthdate: this.formatDate(this.clienteForm.value.birthdate),
        state: 'A'
      };
      if (this.editingCliente) {
        const index = this.clientes.findIndex(c => c.id === this.editingCliente!.id);
        this.clientes[index] = { ...newCliente, id: this.editingCliente.id };
        this.editingCliente = null;
      } else {
        this.clientes.push({ ...newCliente, id: this.clientes.length + 1 });
      }
      this.updateDataSource();
      this.toggleForm();
    }
  }

  editCliente(cliente: Cliente) {
    this.editingCliente = cliente;
    this.clienteForm.setValue({
      names: cliente.names,
      last_names: cliente.last_names,
      document_type: cliente.document_type,
      document_number: cliente.document_number,
      email: cliente.email,
      phone: cliente.phone,
      birthdate: new Date(cliente.birthdate.split('/').reverse().join('-')),
      state: cliente.state
    });
    this.toggleForm();
  }

  deleteCliente(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea eliminar este cliente?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.clientes.findIndex(cliente => cliente.id === id);
        if (index !== -1) {
          this.clientes[index].state = 'I';
          this.updateDataSource();
        }
      }
    });
  }

  restoreCliente(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea restaurar este cliente?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.clientes.findIndex(cliente => cliente.id === id);
        if (index !== -1) {
          this.clientes[index].state = 'A';
          this.updateDataSource();
        }
      }
    });
  }

  toggleClientes(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.updateDataSource();
  }

  applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filterPredicate = (cliente: Cliente, filter: string) => {
      const matchesFilter = this.filterCliente(cliente, filter);
      return matchesFilter;
    };
    this.dataSource.filter = filterValue;
  }

  updateDataSource() {
    this.dataSource.data = this.clientes.filter(cliente => this.mostrarActivos ? cliente.state === 'A' : cliente.state === 'I');
    this.applyFilter();
  }

  filterCliente(cliente: Cliente, filterValue: string): boolean {
    return (
      cliente.names.toLowerCase().includes(filterValue) ||
      cliente.last_names.toLowerCase().includes(filterValue) ||
      cliente.document_number.includes(filterValue) ||
      cliente.email.toLowerCase().includes(filterValue) ||
      cliente.phone.includes(filterValue)
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

    return [day, month, year].join('/');
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

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

interface Product {
  id_prod: number;
  name_product: string;
  brand: string;
  model: string;
  serie: string;
  purchase_date: string;
  warranty: string;
  physicalLocation: string;
  category: string;
  state: string;
}


@Component({
  selector: 'app-products',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductsComponent implements OnInit {
  productForm: FormGroup;
  showForm = false;
  mostrarActivos = true;
  searchTerm = '';
  editingProduct: Product | null = null;

  products: Product[] = [
    { id_prod: 1, name_product: 'Laptop', brand: 'HP', model: 'Envy', serie: '1234ABC', purchase_date: '01/01/2022', warranty: '2 años', physicalLocation: 'Oficina', category: 'Electrónica', state: 'A' },
    { id_prod: 2, name_product: 'Impresora', brand: 'Canon', model: 'Pixma', serie: '5678DEF', purchase_date: '02/03/2021', warranty: '1 año', physicalLocation: 'Laboratorio', category: 'Impresión', state: 'A' }
  ];
  
  displayedColumns: string[] = ['id_prod', 'name_product', 'brand', 'model', 'serie', 'purchase_date', 'warranty', 'physicalLocation', 'category', 'state', 'acciones'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.productForm = this.fb.group({
      name_product: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      serie: ['', Validators.required],
      purchase_date: ['', Validators.required],
      warranty: ['', Validators.required],
      physicalLocation: ['', Validators.required],
      category: ['', Validators.required],
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
      this.editingProduct = null;
      this.productForm.reset();
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const newProduct: Product = {
        ...this.productForm.value,
        purchase_date: this.formatDate(this.productForm.value.purchase_date),
        state: 'A'
      };
      if (this.editingProduct) {
        const index = this.products.findIndex(p => p.id_prod === this.editingProduct!.id_prod);
        this.products[index] = { ...newProduct, id_prod: this.editingProduct.id_prod };
        this.editingProduct = null;
      } else {
        this.products.push({ ...newProduct, id_prod: this.products.length + 1 });
      }      
      this.updateDataSource();
      this.toggleForm();
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.setValue({
      name_product: product.name_product,
      brand: product.brand,
      model: product.model,
      serie: product.serie,
      purchase_date: new Date(product.purchase_date.split('/').reverse().join('-')),
      warranty: product.warranty,
      physicalLocation: product.physicalLocation,
      category: product.category,
      state: product.state
    });
    this.toggleForm();
  }

  deleteProduct(id_prod: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea eliminar este producto?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.products.findIndex(product => product.id_prod === id_prod);
        if (index !== -1) {
          this.products[index].state = 'I';
          this.updateDataSource();
        }
      }
    });
  }

  restoreProduct(id_prod: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea restaurar este producto?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.products.findIndex(product => product.id_prod === id_prod);
        if (index !== -1) {
          this.products[index].state = 'A';
          this.updateDataSource();
        }
      }
    });
  }

  toggleProducts(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.updateDataSource();
  }

  applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filterPredicate = (product: Product, filter: string) => {
      return this.filterProduct(product, filter);
    };
    this.dataSource.filter = filterValue;
  }

  updateDataSource() {
    this.dataSource.data = this.products.filter(product => this.mostrarActivos ? product.state === 'A' : product.state === 'I');
    this.applyFilter();
  }

  filterProduct(product: Product, filterValue: string): boolean {
    return (
      product.name_product.toLowerCase().includes(filterValue) ||
      product.brand.toLowerCase().includes(filterValue) ||
      product.model.toLowerCase().includes(filterValue) ||
      product.serie.includes(filterValue)
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

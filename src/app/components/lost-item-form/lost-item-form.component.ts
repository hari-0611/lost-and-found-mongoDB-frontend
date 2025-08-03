import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-lost-item-form',
  templateUrl: './lost-item-form.component.html',
  styleUrls: ['./lost-item-form.component.css'],
})
export class LostItemFormComponent {
  lostItemForm!: FormGroup;
  categories = [
    'Electronics',
    'Clothing',
    'Documents',
    'Accessories',
    'Others',
  ];
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  itemId: number = 0;
  item: any;
  isEditMode: boolean = false;
  maxDate: Date = new Date();
  username: string = '';
  image: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.username = user.username;
    }
    if (this.route.snapshot.params['id']) {
      const baseUrl = 'http://localhost:3000';
      this.itemId = this.route.snapshot.params['id'];
      this.isEditMode = true;
      this.apiService.getItemById(this.itemId).subscribe((data) => {
        this.item = data;
        this.image = this.item.image;
        console.log(this.item.itemName);
        this.lostItemForm.patchValue({
          itemName: this.item.itemName,
          category: this.item.category,
          description: this.item.description,
          lastSeenLocation: this.item.lastSeenLocation,
          dateLost: this.item.dateLost,
          contactInfo: this.item.contactInfo,
          phone_number: this.item.phone_number,
          address: this.item.address,
          username: this.item.username || this.username,
          imagePreview: this.item.image,
        });
        // console.log(this.item.imageUrl);
      });
    }

    // console.log('inside lost item form');
    // console.log(this.itemId);

    this.lostItemForm = this.fb.group({
      itemName: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      lastSeenLocation: [''],
      dateLost: [''],
      contactInfo: ['', [Validators.required, Validators.email]],
      phone_number: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      address: ['', Validators.required],
      username: [this.username, Validators.required],
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  onSubmit(): void {
    if (this.lostItemForm.invalid || !this.selectedImage) {
      this.snackBar.open(
        'Please fill all required fields and select an image',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const formData = new FormData();
    Object.entries(this.lostItemForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append('image', this.selectedImage);
    if (this.itemId != 0) {
      console.log('inside if');
      this.apiService.updateLostItem(this.itemId, formData).subscribe({
        next: () => {
          this.snackBar.open('Item updated successfully!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/lost-items']);
        },
        error: () => {
          this.snackBar.open('Something went wrong!', 'Close', {
            duration: 3000,
          });
        },
      });
    } else {
      // console.log('inside else');
      this.apiService.createLostItem(formData).subscribe({
        next: () => {
          this.snackBar.open('Item reported successfully!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/lost-items']);
        },
        error: () => {
          this.snackBar.open('Something went wrong!', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
}

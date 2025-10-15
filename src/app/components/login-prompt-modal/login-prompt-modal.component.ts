import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-prompt-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './login-prompt-modal.component.html',
  styleUrls: ['./login-prompt-modal.component.scss']
})
export class LoginPromptModalComponent {  dialogRef = inject<MatDialogRef<LoginPromptModalComponent>>(MatDialogRef);

}
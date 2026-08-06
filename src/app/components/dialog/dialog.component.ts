import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from './dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  constructor(public dialogService: DialogService) {}

  responder(valor: boolean): void {
    this.dialogService.responder(valor);
  }
}

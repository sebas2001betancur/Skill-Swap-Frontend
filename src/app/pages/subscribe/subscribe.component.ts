import { Component, inject } from '@angular/core';
import { WompiService } from '../../services/wompi.service'; // <-- USA EL NUEVO SERVICIO
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs'; // <-- Para tomar solo una emisión

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscribe.component.html',
})
export class SubscribeComponent {
  private wompiService = inject(WompiService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);

  isProcessing = false;
  error: string | null = null;

  pay(): void {
    this.isProcessing = true;
    this.error = null;
    
    // Generamos una referencia temporal para el widget. La real se creará en el backend.
    const tempReference = 'SKILLSWAP-WIDGET-' + Date.now();
    const amountInCents = 1290000;

    // 1. Llamamos a nuestro wrapper. Mucho más limpio.
    this.wompiService.openCheckout(amountInCents, tempReference).pipe(
      take(1) // Nos aseguramos de que la suscripción se cierre después de la primera emisión.
    ).subscribe({
      next: (result) => {
        if (result.error) {
          this.error = result.error.reason || 'El pago fue cancelado o falló.';
          this.isProcessing = false;
        } else if (result.data?.payment_source_id) {
          // 2. Si tenemos un ID de fuente de pago, llamamos a nuestro backend.
          const paymentSourceId = result.data.payment_source_id;
          this.paymentService.createTransaction(paymentSourceId).subscribe({
            next: (response) => {
              console.log('Transacción creada en nuestro backend:', response);
              this.router.navigate(['/payment-success'], { queryParams: { status: response.data.status } });
            },
            error: (err) => {
              this.error = 'No se pudo procesar la transacción en nuestro servidor.';
              this.isProcessing = false;
              console.error(err);
            }
          });
        } else {
            this.error = 'Resultado inesperado de Wompi.';
            this.isProcessing = false;
        }
      },
      error: (err) => {
        this.error = err.error.reason;
        this.isProcessing = false;
      }
    });
  }
}
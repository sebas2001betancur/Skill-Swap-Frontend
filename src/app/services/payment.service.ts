import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaz para la respuesta de nuestro backend
export interface WompiTransactionResponse {
  data: {
    id: string;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/api/Payments`;

  // Este método recibirá el ID de la fuente de pago de Wompi
  // y lo enviará a nuestro backend para crear la transacción.
  createTransaction(paymentSourceId: number): Observable<WompiTransactionResponse> {
    const payload = { paymentSourceId };
    return this.http.post<WompiTransactionResponse>(`${this.apiUrl}/create-transaction`, payload);
  }
}
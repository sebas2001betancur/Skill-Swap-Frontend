import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subscriber } from 'rxjs';

// Declaramos el tipo global para que TypeScript no se queje.
interface WompiCheckoutOptions {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
}

interface WompiCheckoutInstance {
  open(callback: (result: WompiResult) => void): void;
}

declare const WompiCheckout: new (options: WompiCheckoutOptions) => WompiCheckoutInstance;

// Interfaz para el resultado del widget, para tener tipado fuerte.
export interface WompiTransaction {
  id: string;
  status: string;
  amount_in_cents: number;
  reference: string;
  // Add other properties as needed
}

export interface WompiResult {
  error?: {
    type: string;
    reason: string;
  };
  data?: {
    transaction: WompiTransaction;
    payment_source_id: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WompiService {
  private platformId = inject(PLATFORM_ID);

  private isBrowser: boolean;
  private publicKey = 'pub_test_...'; // <-- TU LLAVE PÚBLICA DE WOMPI AQUÍ

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Inicia el proceso de checkout de Wompi.
   * Envuelve el callback del widget en un Observable para un manejo más limpio y reactivo.
   * 
   * @param amountInCents El monto a cobrar en centavos.
   * @param reference La referencia única para el pago.
   * @returns Un Observable que emite el resultado del widget cuando el usuario completa la acción.
   */
  openCheckout(amountInCents: number, reference: string): Observable<WompiResult> {
    // Envolvemos la lógica basada en callbacks en un Observable.
    return new Observable((subscriber: Subscriber<WompiResult>) => {
      // Si no estamos en un navegador, no podemos mostrar el widget.
      if (!this.isBrowser) {
        subscriber.error({ error: { type: 'ENVIRONMENT_ERROR', reason: 'Wompi Checkout solo puede ejecutarse en un navegador.' } });
        return;
      }

      try {
          const checkout = new WompiCheckout({ 
          currency: 'COP',
          amountInCents: amountInCents,
          reference: reference,
          publicKey: this.publicKey,
          redirectUrl: 'https://tusitio.com/payment-result', // URL de respaldo
        });

        // Abrimos el widget y le pasamos el callback.
        checkout.open((result: WompiResult) => {
          // Cuando el callback se ejecuta (el usuario pagó o cerró el modal),
          // emitimos el resultado a través del Observable y lo completamos.
          subscriber.next(result);
          subscriber.complete();
        });

       } catch {
         // Si hay un error al instanciar el widget, lo notificamos.
         subscriber.error({ error: { type: 'INITIALIZATION_ERROR', reason: 'No se pudo inicializar el widget de Wompi.' } });
       }
    });
  }
}
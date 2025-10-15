import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true // <-- La CLI lo genera así, lo que permite importarlo en otros componentes
})
export class TruncatePipe implements PipeTransform {

  /**
   * Transforma una cadena de texto, cortándola a una longitud máxima
   * y añadiendo puntos suspensivos.
   * 
   * Uso en la plantilla: {{ miTextoLargo | truncate:100:'...' }}
   * 
   * @param value La cadena de texto original.
   * @param limit El número máximo de caracteres a mostrar (por defecto 100).
   * @param trail La cadena a añadir al final si el texto se corta (por defecto '...').
   * @returns La cadena de texto truncada.
   */
  transform(value: string, limit = 100, trail = '...'): string {
    // Si el valor no es una cadena o es más corto que el límite, no hacemos nada.
    if (!value || value.length <= limit) {
      return value;
    }

    // Cortamos la cadena y añadimos los puntos suspensivos.
    return value.substring(0, limit) + trail;
  }

}
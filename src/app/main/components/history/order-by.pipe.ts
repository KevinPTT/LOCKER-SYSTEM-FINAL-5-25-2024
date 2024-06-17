import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: any[], property: string[]): any[] {
    if (!value || !property || property.length === 0) { // Baguhin ang kondisyon dito
      return value;
    }

    const direction = property[0][0] === '-' ? -1 : 1;
    const propertyName = direction === -1 ? property[0].substr(1) : property[0];

    return value.sort((a, b) => {
      if (a[propertyName] < b[propertyName]) {
        return -1 * direction;
      } else if (a[propertyName] > b[propertyName]) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
  }

}

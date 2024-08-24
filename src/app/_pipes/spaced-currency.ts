import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({ name: 'spacedCurrency' })
export class SpacedCurrencyPipe implements PipeTransform {
    transform(num: any, currencyCode: string, showSymbol: boolean, digits: string): any {
        let value = new CurrencyPipe(navigator.language).transform(num, currencyCode, showSymbol, digits);
        let firstDigit = value!.match(/\d/);
        if (value === null || firstDigit === null)
        {
          return currencyCode + " " + num;
        }
        let symbol = value.slice(0, firstDigit.index);
        let amount = value.slice(firstDigit.index);   
        return symbol + " " + amount;
    }
}
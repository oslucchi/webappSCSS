import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appTwoDigitDecimalNumber]'
})

export class TwoDigitDecimalNumberDirective implements OnInit{
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
    @Input('appTwoDigitDecimalNumber') numOfDecimals: number = 0;


  constructor(private el: ElementRef)  {
  }
  
  ngOnInit(): void {
    var regexString: string;
    if (this.numOfDecimals === undefined)
      this.numOfDecimals = 2;
    
    if (this.numOfDecimals == 0) 
    {
      regexString = "^\\d*$";
    }
    else
    {
      regexString = "^\\d*\\.?\\d{0," + this.numOfDecimals + "}$";
    }
    this.regex = new RegExp(regexString, 'g');
  }
  
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log(this.el.nativeElement.value);
    console.log(this.el.nativeElement);
    console.log(event);
    if ((this.el.nativeElement.value === undefined) ||
        (this.el.nativeElement.value == null) ||
        (this.el.nativeElement.value == ''))
    {
      this.el.nativeElement.value = "0";      
    }
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
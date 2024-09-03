import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";

@Directive({
  selector: "[matInputNumeric]"
})
export class MatInputNumericDirective {
  @Input("decimals") decimals: number = 0;
  @Input("negative") negative: number = 0;
  @Input("separator") separator: string = ".";

  private checkAllowNegative(value: string) {
    if (this.decimals <= 0) {
      return String(value).match(new RegExp(/^-?\d+$/));
    } else {
      var regExpString =
        "^-?\\s*((\\d+(\\"+ this.separator +"\\d{0," +
        this.decimals +
        "})?)|((\\d*(\\"+ this.separator +"\\d{1," +
        this.decimals +
        "}))))\\s*$";
      return String(value).match(new RegExp(regExpString));
    }
  }

  private formatNumber(value: string): string {
    if (this.decimals > 0) {
      return parseFloat(value).toFixed(this.decimals);
    }
    return parseFloat(value).toString();
  }
  private formatValue(value: any) {
    let allowNegative = this.negative > 0 ? true : false;

    if (allowNegative) {
      if (value !== "" && value !== "-" && !this.checkAllowNegative(value)) {
        this.el.nativeElement.value = this.formatNumber(value);
      }
    } else {
      if (value !== "" && !this.check(value)) {
        this.el.nativeElement.value = this.formatNumber(value);
      }
    }
  }

  private check(value: string) {
    if (this.decimals <= 0) {
      return String(value).match(new RegExp(/^\d+$/));
    } else {
      var regExpString =
        "^\\s*((\\d+(\\"+ this.separator +"\\d{0," +
        this.decimals +
        "})?)|((\\d*(\\"+ this.separator +"\\d{1," +
        this.decimals +
        "}))))\\s*$";
      return String(value).match(new RegExp(regExpString));
    }
  }

  private run(oldValue: any) {
    setTimeout(() => {
      let currentValue: string = this.el.nativeElement.value;
      let allowNegative = this.negative > 0 ? true : false;

      if (allowNegative) {
        if (
          !["", "-"].includes(currentValue) &&
          !this.checkAllowNegative(currentValue)
        ) {
          this.el.nativeElement.value = oldValue;
        }
      } else {
        if (currentValue !== "" && !this.check(currentValue)) {
          this.el.nativeElement.value = oldValue;
        }
      }
    });
  }

  constructor(private el: ElementRef) {}

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    this.run(this.el.nativeElement.value);
  }

  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) {
    this.run(this.el.nativeElement.value);
  }

  @HostListener('blur', ['$event']) onBlur(event: any) {
    const value = this.el.nativeElement.value;
    this.el.nativeElement.value = parseFloat(value).toFixed(this.decimals);
  }

}
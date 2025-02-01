import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Directive({
  selector: '[ngInclude]'
})
export class NgIncludeDirective implements OnInit {
  private _htmlUrl: string | undefined;

  @Input('ngInclude')
  set htmlUrl(url: string) {
    this._htmlUrl = url;
    this.loadHtmlContent(); // Load content when input changes
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (this._htmlUrl) {
      this.loadHtmlContent();
    }
  }

    private loadHtmlContent(): void {
        console.log('ngInclude directive initialized'); // Debugging
        if (this._htmlUrl) {
            console.log('Attempting to fetch:', this._htmlUrl); // Debugging
            this.http
                .get(this._htmlUrl, { responseType: 'text' })
                .pipe(
                    catchError(error => {
                        console.error('Error loading HTML:', error.message); // Log error details
                        return of('<p>Error loading content</p>'); // Fallback content
                    })
                )
                .subscribe({
                    next: content => {
                        console.log('Fetched HTML Content:', content); // Debugging
                        this.renderer.setProperty(this.el.nativeElement, 'innerHTML', content);
                    },
                    error: err => console.error('Subscription Error:', err),
                    complete: () => console.log('HTML content loading complete') // Debugging
                });
        } else {
            console.warn('No URL provided to ngInclude'); // Debugging
        }
    }
}

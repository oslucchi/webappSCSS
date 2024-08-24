import { MatDialog } from "@angular/material/dialog";
import { Observable, Subject } from "rxjs";
import { MessageBoxDialog } from "./msg-box.component";
import { Injectable } from "@angular/core";
import { Button, Buttons } from "./msg-box.common";

@Injectable()
export class MessageBox {
  constructor(private dialog: MatDialog) {
  }

  private dialogResultSubject!: Subject<Button>;
  dialogResult$!: Observable<Button>;

  show(message: string, title?: string, buttons?: Buttons): MessageBox {

    let dialogRef = this.dialog.open(MessageBoxDialog, {
        data: {
          message,
          title,
          buttons: Buttons.Ok
        }
      }
    );

    this.dialogResultSubject = new Subject<Button>();
    this.dialogResult$ = this.dialogResultSubject.asObservable()

    dialogRef.componentInstance.dialogResult$.subscribe(pressedButton => {
      this.dialogResultSubject.next(pressedButton);
      this.dialogResultSubject.complete();
      dialogRef.close();
    });

    return this;
  }
}
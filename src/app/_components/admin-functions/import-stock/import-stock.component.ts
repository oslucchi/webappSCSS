import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../../_services/api.service";

@Component({
  selector: "app-admin-functions/import-stock",
  templateUrl: "./import-stock.component.html",
  styleUrls: ["./import-stock.component.scss"],
})
export class ImportStockComponent implements OnInit {
  public disableButtons: boolean = false;
  public cssClass: String = "";
  file: File | any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {}

  onFileSelected(event: any) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.file = fileList[0];
    } else {
      this.file = null;
      window.alert("Empty list of files");
    }
  }

  importStock() {
    this.disableButtons = true;
    this.apiService
      .post("admin/uploadStock", {
        filepath: this.file.name,
      })
      .subscribe((res: HttpResponse<any>) => {
        window.alert("Importazione completata\n" + res.body.message);
        console.log(res);
        this.disableButtons = false;
        this.file = null;
      });
  }
}

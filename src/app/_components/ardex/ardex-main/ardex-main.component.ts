import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../_services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger} from '@angular/material/menu'; 
import { MessageBox } from '../../../_components/msg-box/msg-box.provider';

@Component({
  selector: 'app-ardex-main',
  templateUrl: './ardex-main.component.html',
  styleUrls: ['./ardex-main.component.scss']
})
export class ArdexMainComponent implements OnInit {
  @ViewChild(MatMenuTrigger, {static: false}) trigger: MatMenuTrigger | undefined ;
  
  private service: ApiService;

  public recHisShow: boolean = false;
  public recPrgShow: boolean = false;
  public stockStatShow: boolean = false;
  public stockAdjShow: boolean = false;
  public articlesShow: boolean = false;

  constructor(private apiService: ApiService,
                private mb: MessageBox,
                private dialog: MatDialog) 
  {
    this.service = apiService;
  }

  ngOnInit(): void {
        
  }


  ricevimentoStorico(){
    this.recHisShow = true;
    this.recPrgShow = false;
    this.stockStatShow = false;
    this.stockAdjShow = false;
    this.articlesShow = false;
  }

  ricevimentoProgrammate() {
    this.recPrgShow = true;
    this.recHisShow = false;
    this.stockStatShow = false;
    this.stockAdjShow = false;
    this.articlesShow = false;
  }

  stockStatus(){
    this.stockStatShow = true;
    this.recHisShow = false;
    this.recPrgShow = false;
    this.stockAdjShow = false;
    this.articlesShow = false;
  }

  stockAdjustments(){
    this.stockAdjShow = true;
    this.recHisShow = false;
    this.recPrgShow = false;
    this.stockStatShow = false;
    this.articlesShow = false;
  }

  articles(){
    this.articlesShow = true;
    this.recPrgShow = false;
    this.recHisShow = false;
    this.stockStatShow = false;
    this.stockAdjShow = false;
  }
}

import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subscription, Observable, timer } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-auto-refresh',
  templateUrl: './auto-refresh.component.html',
  styleUrls: ['./auto-refresh.component.scss']
})

export class AutoRefreshComponent implements OnInit {
	private subscription: Subscription | undefined;
	@Output() TimerExpired: EventEmitter<any> = new EventEmitter<any>();
	@Output() timerResetChange: EventEmitter<any> = new EventEmitter<any>();
	// @Input() SearchDate: moment.Moment = moment();
	@Input() timerSet: number = 0;
	@Input() timerReset: boolean = false;

	private searchEndDate: moment.Moment;
	private remainingTime: number = 0;
	private everySecond: Observable<number> = timer(0, 1000);
	private currentTime: moment.Moment;

	public minutes: number = 0;
	public seconds: number = 0;

	constructor(private ref: ChangeDetectorRef) 
	{
		if (this.timerSet == 0)
			  this.timerSet = 3;
		this.currentTime = moment();
		this.searchEndDate = this.currentTime.add(this.timerSet, "minutes");
	}

	ngOnInit() 
	{
		this.subscription = this.everySecond.subscribe((seconds) => {
			this.currentTime = moment();
			if (this.timerReset)
			{
				this.timerReset = false;
				this.timerResetChange.emit(this.timerReset);
				this.searchEndDate = moment(this.currentTime).add(this.timerSet, "minutes");
			}
			this.remainingTime = this.searchEndDate.valueOf() - this.currentTime.valueOf();
			this.remainingTime = this.remainingTime / 1000;
			if (this.remainingTime <= 0) {
				this.searchEndDate = moment(this.currentTime).add(this.timerSet, "minutes");
				this.TimerExpired.emit();
			}
			else {
				this.minutes = Math.floor(this.remainingTime / 60);
				this.seconds = Math.floor(this.remainingTime - this.minutes * 60);
			}
			this.ref.markForCheck()
		})
	}

	ngOnDestroy(): void 
	{
		this.subscription!.unsubscribe();
	}
}
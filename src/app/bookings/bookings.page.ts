import { Component, OnInit } from '@angular/core';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  loadedbookings:Booking[];
  isLoading =false;
  private bookingSub :Subscription;

  constructor(private bookingService:BookingService,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.bookingSub =this.bookingService.bookings.subscribe(
      booking =>{
        this.loadedbookings =booking;
      }
    );
    
  }
  ionViewWillEnter(){
    this.isLoading=true;
    this.bookingService.fetchBooking().subscribe(()=>{
      this.isLoading=false;
    });
  }
  ngOnDestroy(){
    if(this.bookingSub){
      this.bookingSub.unsubscribe();
    }
  }
  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl.create({ message: 'Cancelling...' }).then(loadingEl => {
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }


}

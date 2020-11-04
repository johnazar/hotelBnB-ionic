import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Place } from 'src/app/places/place.model';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
@Input() selectedPlace:Place;
@Input() selectedMode: 'select'|'random';
@ViewChild('bookform',{static:true}) from :NgForm;
starDate:string;endDate:string;
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {
    const availabeFrom = new Date(this.selectedPlace.availabeFrom);
    const availabeTill = new Date(this.selectedPlace.availabetill);
    if(this.selectedMode === 'random'){
      this.starDate = new Date(availabeFrom.getTime()+ 
      Math.random()*
      (availabeTill.getTime()-7*24*60*60*1000-availabeFrom.getTime())).toISOString();
      this.endDate = 
      new Date(new Date(this.starDate).getTime()+
      Math.random() * 
      (new Date(this.starDate).getTime() + 
       6*24*60*60*1000 - new Date(this.starDate).getTime())).toISOString();
      

    }
  }
  onBookPlace(){
    if(!this.from.valid || !this.datesVaild){
      return;
    }
    //this.modalCtrl.dismiss({message:'Book this place '+ this.selectedPlace.title},"confirm");
    this.modalCtrl.dismiss({
      bookingData:{
        firstName:this.from.value['first-name'],
        lastName:this.from.value['last-name'],
        //gust is a number
        gusts:+this.from.value['gusts=number'],
        // mask as date
        startdate:new Date (this.from.value['date-from']),
        enddate:new Date (this.from.value['date-till']),

      },
      message:'Book this place '+ this.selectedPlace.title},"confirm");

  }
  datesVaild(){
    const startDate = new Date(this.from.value['date-from']);
    const endData = new Date(this.from.value['date-till']);
    return endData>startDate;

  }
  onCancel(){
    this.modalCtrl.dismiss(null, 'cancel');

  }


}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit , OnDestroy{
  offers: Place [];
  isLoading=false;
  private placesSub: Subscription;
  constructor(private placesService:PlacesService, private router:Router) { }

  ngOnInit() {
   //this.offers= this.placesService.places;
   this.placesSub = this.placesService.places.subscribe(pl=>{
     this.offers =pl; 
   });
  }
  //fetch places here
  ionViewWillEnter(){
    this.isLoading =true;
    this.placesService.fetchPlaces().subscribe(()=>{
      this.isLoading = false;
    });
  }
  ngOnDestroy(){
    if(this.placesSub)
    this.placesSub.unsubscribe();
  }
  onEdit(offerId:string, slidingitlem: IonItemSliding){
    slidingitlem.close(); //close sliding item
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('goto editing Item',offerId );
  }

}

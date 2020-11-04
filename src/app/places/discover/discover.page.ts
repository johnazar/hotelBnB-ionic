import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { MenuController } from '@ionic/angular';
import {SegmentChangeEventDetail} from '@ionic/core'; //importat
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit,OnDestroy {
  loadedplaces: Place[];
  isLoading=false;
  listedLoadedPlaces: Place[];
  relevantPlaces:Place[];
  private placesSub: Subscription;


  constructor(private placesService:PlacesService, private menuCtrl: MenuController,
    private authService:AuthService) { }

  ngOnInit() {
    //this.loadedplaces = this.placesService.places;
   this.placesSub = this.placesService.places.subscribe(pl=>{
      this.loadedplaces=pl;
      this.relevantPlaces = this.loadedplaces;
      this.listedLoadedPlaces= this.relevantPlaces.slice(1);

    })
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
  onOpenMenu(){
    this.menuCtrl.toggle();
  }
  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>){
    this.authService.userId.pipe(take(1)).subscribe(userId=>{
      if(event.detail.value === 'all')
    {
      this.relevantPlaces = this.loadedplaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);

    } else{
      this.relevantPlaces = this.loadedplaces.filter(
        place =>place.userId !== userId);
        this.listedLoadedPlaces= this.relevantPlaces.slice(1);
    }
    console.log(event.detail);

    })
    

  }

}

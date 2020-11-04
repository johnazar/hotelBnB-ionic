import { HttpClient } from '@angular/common/http';
import { Component, OnInit, EventEmitter, Output,Input } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import{environment} from '../../../../environments/environment';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation, Coordinates } from 'src/app/places/location.model';
import { from, of } from 'rxjs';
import{Plugins,Capacitor}from '@capacitor/core';


@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPicked = new EventEmitter<PlaceLocation>();
  @Input() showPreview =false;
  selectedLocationImage:string;
  isLoading=false;
  constructor(private modalCtrl:ModalController,private http:HttpClient, private actionSheetCtrl:ActionSheetController, private alertCtrl:AlertController) { }

  ngOnInit() {}
  onPickLocation(){
    this.actionSheetCtrl.create({
      header:'Please Choose',
      buttons:[
        {text:'Auto-Locate',handler:()=>{ this.locateUser();}},
        {text:'Pick on Map',handler:()=>{ this.openMap();}},
        {text:'Cancel',role:'cancel'}
      ]
    }).then(ActionEL => {
      ActionEL.present();
    });
    
  }
  private locateUser(){
    //use capacitor GEO
    if(!Capacitor.isPluginAvailable('Geolocation')){
      this.showErrorAlert();
      return;
    }
    this.isLoading=true;
    Plugins.Geolocation.getCurrentPosition()
    .then(geoPosiotion=>{
      const coord : Coordinates = {lat: geoPosiotion.coords.latitude ,lng:geoPosiotion.coords.longitude };
      this.creatPlace(coord.lat,coord.lng);
      this.isLoading=false;

    })
    .catch(err=>{
      this.isLoading=false;
      this.showErrorAlert();
    })


  }

  private openMap(){
    this.modalCtrl.create({component: MapModalComponent})
    .then(modalEl => {
      modalEl.onDidDismiss().then(modalData =>{
        //console.log(modalData.data);
        if(!modalData.data){
          return;
        }
        const coordinates:Coordinates ={
          lat:modalData.data.lat,
          lng:modalData.data.lng,
          };
        
          this.creatPlace(coordinates.lat,coordinates.lng);
        //.subscribe(adress=>{console.log(adress);});
        
      });
      modalEl.present();
    })
    // catch added by john
    .catch(err=>{
      this.showErrorAlert();
    });
  }
  private creatPlace(Lat:number,Lng:number){
    const pickedLocation :PlaceLocation ={
      lat:Lat,
      lng:Lng,
      address:null,
      staticMapImageUrl:null
      };
    this.isLoading=true;
        this.getAddress(Lat,Lng).pipe(
          switchMap(addres =>{
            pickedLocation.address =addres;
            return of(this.getMapImageUrl(pickedLocation.lat,pickedLocation.lng,14)) 
          })
        )
        .subscribe(staticMapImageUrl=>{
           pickedLocation.staticMapImageUrl=staticMapImageUrl;
           this.selectedLocationImage = staticMapImageUrl;
           this.isLoading=false;
           this.locationPicked.emit(pickedLocation);
        });
  }

  private showErrorAlert(){
    this.alertCtrl.create({
      header:'Could not fetch location',
      message:'Please use map to pick location',
      buttons:['Okay']
    }).then(alertEl=>{alertEl.present();});
  }

  private getAddress(lat:number,lng:number){
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMApsAPIKey}`)
    .pipe(map((geoData:any) =>{
      console.log(geoData);
      if(!geoData||!geoData.results||!geoData.results.length){
        return null;

      }
      return geoData.results[0].formatted_address;
    }))

  }
  private getMapImageUrl (lat:number,lng:number,zoom:number){
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMApsAPIKey}`;
  }

}

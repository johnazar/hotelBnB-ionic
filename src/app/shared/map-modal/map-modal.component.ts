import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import{environment} from '../../../environments/environment';
import { resolve } from 'dns';
import { rejects } from 'assert';

import { from } from 'rxjs';


@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit,OnDestroy {
  @ViewChild('mapRef') mapElementRef : ElementRef; // map is the refrence name in html template
  @Input() center = {lat:56.312648, lng:44.028867};
  @Input() selectable =true;
  @Input() closeBtnText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener:any;
  googleMaps:any;

  constructor(private modalCtrl: ModalController, private renderer:Renderer2) { }

  ngOnInit() {}
  ngAfterViewInit(){
    this.getGoogleMaps()
    .then( googleMaps =>{
      this.googleMaps = googleMaps;
      const mapEl =  this.mapElementRef.nativeElement;// native element is the actual div where the map
      const map = new googleMaps.Map(
        mapEl, {
          center:this.center,
          zoom:14
              }
        );

        this.googleMaps.event.addListenerOnce(map , 'idle',()=>{
        this.renderer.addClass(mapEl,'visible')
      });
      //map is the div we created
      if(this.selectable){
        this.clickListener = map.addListener('click', event =>{
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()};
          this.modalCtrl.dismiss(selectedCoords);
        });

      }else{
        const marker = new googleMaps.Marker({
          position : this.center,
          map:map,
          title:'Pick Location'
        });
        marker.setMap(map);
      }
      
    }).catch(err =>{
      console.log(err);//Google maps SDK not available
    })
  }
  onCancel(){

    this.modalCtrl.dismiss();

  }
  // private method to Load JS SDK
  private getGoogleMaps() : Promise<any>{
    const win = window as any; // global variable js refer to the window, use any to have to error
    const googleModule = win.google; // win.google will be set as we import JS SDK
    if(googleModule&& googleModule.maps){
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      /* this will create :
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
      type="text/javascript"></script>
      */
      script.src =`https://maps.googleapis.com/maps/api/js?key=${environment.googleMApsAPIKey}&callback=initMap`;
      script.async =true;
      script.defer =true;
      script.type="text/javascript";
      document.body.appendChild(script);
      script.onload = ()=>{
        const loadedGoogleModule = win.google;
        if(loadedGoogleModule && loadedGoogleModule.maps)
        {resolve(loadedGoogleModule.maps);}
        else{
          reject('Google maps SDK not available')
        }

      }
    })
  }
  ngOnDestroy(){
    if(this.clickListener){
      this.googleMaps.event.removeListener(this.clickListener);
    }
    
    
  }
  


}

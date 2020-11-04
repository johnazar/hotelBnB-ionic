import { Component, OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';
import { error } from 'protractor';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { switchMap,take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy  {
  place:Place;
  isBookable:boolean=false;
  isLoading =false;
  private placesSub: Subscription;
  constructor(
    private placesService:PlacesService, 
    private route:ActivatedRoute, 
    private navCtrl:NavController,
    private modalCtrl:ModalController,
    private actionCtrl:ActionSheetController,
    private bookinServ:BookingService,
    private loadingCtrl:LoadingController,
    private authService:AuthService,
    private alertCtrl:AlertController,
    private router:Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paraMap =>{
      if(!paraMap.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.isLoading =true;

      let fetxhedUserId :string;
      console.log(paraMap.has('placeId'));
      console.log(paraMap.get('placeId'));
      this.authService.userId.pipe(
        take(1),
        switchMap(userId=>{
        if(!userId){
          throw new Error('No user id found');
      }
      fetxhedUserId = userId;
      return this.placesService
      .getPlace(paraMap.get('placeId'));
      })).subscribe(pl=>{
       this.place=pl;
       this.isBookable = pl.userId !== fetxhedUserId;
       this.isLoading=false;
     }, error =>{
       this.alertCtrl.create({
         header: 'An error occurred!',
         message: 'Could not load',
         buttons:[{text:'okay',handler:()=>{
           this.router.navigate(['/places/tabs/discover'])
         }}]
       }).then(alertEL=>alertEL.present())
     });
      console.log(this.place);


    }); // always runs
  }
  onShowFullMap(){
    this.modalCtrl.create({component: MapModalComponent,componentProps:{
      center:{lat:this.place.location.lat,lng:this.place.location.lng},
      selectable:false,
      closeBtnText:'Close',
      title:this.place.location.address
    }
    }).then(modalEl=>{
      modalEl.present();
    });
  }
  ngOnDestroy(){
    if(this.placesSub)
    this.placesSub.unsubscribe();

  }
  onBookPlace(){
    //this.router.navigateByUrl('/places');
    //this.navCtrl.navigateBack('/places');
    this.actionCtrl
    .create({
      header: 'Choose an Action',
      buttons:[
        {
          text:'Select Date',
          icon:'calendar-outline',
          handler:()=>{ this.openBookinModal('select');}
        },
        {
          text:'Random Date',
          icon:'calendar-outline',
          
          handler:()=>{ this.openBookinModal('random');}
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    })
    .then(actionEl=>{
      actionEl.present();
    });
  

  }
  openBookinModal(mode: 'select'| 'random'){
    console.log(mode);
    this.modalCtrl
    .create({component: CreateBookingComponent, 
      componentProps:{selectedPlace: this.place, selectedMode: mode}})
    .then(modalEl => { modalEl.present();
      return modalEl.onDidDismiss();
    }).then(resualtData =>{
            console.log(resualtData.data,resualtData.role);
            if(resualtData.role==='confirm'){
              this.loadingCtrl.create({message:'Booking place...'}).then(
                loadEl=>{
                  //what to do while waiting
                  loadEl.present();
                  const data =resualtData.data.bookingData;
                  this.bookinServ.addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.gusts,
                  data.startdate,
                  data.enddate
                )// then subsecribe and with till operation finishes then run function inside subsecribe
                .subscribe(()=>{
                  loadEl.dismiss()
                })

                }
              )

              //console.log('BOOKED!');
              
            }
    });

  }


}

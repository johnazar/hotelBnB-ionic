import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../../places.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Place } from '../../place.model';
import { FormGroup } from '@angular/forms';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  offer: Place;
  placeId: string;
  form: FormGroup;
  isLoading = false;
  private placesSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadinCtrl: LoadingController,
    private alertCtrl:AlertController)
     { }

  ngOnInit() {
    this.route.paramMap.subscribe(paraMap => {
      if (!paraMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeId = paraMap.get('placeId');
      this.isLoading = true;
      console.log('do we have id =' + paraMap.has('placeId'));
      console.log('the id is =' + paraMap.get('placeId'));

      this.placesSub = this.placesService.getPlace(paraMap.get('placeId'))
      .subscribe(pl => {
        this.offer = pl;
        console.log('this is pl' + pl);
        // init form after getting data
        this.form = new FormGroup({
          title: new FormControl(this.offer.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.offer.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          })
        });
        this.isLoading = false;
      },error=>{
        this.alertCtrl.create(
          {
            header:'An error occurred!',
            message:'Place could not fetched',
            buttons:[{text:'Okay',handler:()=>{
              this.navCtrl.navigateBack('/places/tabs/offers');
            }}]

          }
        ).then(alertEl=>{
          alertEl.present();
        });

        console.log('this is error= '+error);
      });
      console.log(this.offer);


    }); // always runs

  }
  ngOnDestroy() {
    if (this.placesSub)
      this.placesSub.unsubscribe();

  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    } else {
      // display loader
      this.loadinCtrl.create({
        message: 'Updating ...'
      })
        .then(LoadEL => {
          LoadEL.present();
          this.placesService.updatePlace(
            this.offer.id,
            this.form.value.title,
            this.form.value.description)
            .subscribe(() => {
              LoadEL.dismiss();
              this.form.reset();
              this.navCtrl.navigateBack('/places/tabs/offers');
            });
        });

      /* 
          this.offer.title = this.form.value.title;
          this.offer.description = this.form.value.description; */
      console.log(this.form);
    }
  }

}

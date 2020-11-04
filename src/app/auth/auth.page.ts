import { Component, OnInit } from '@angular/core';
import { AuthService,AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin=false;
 

  constructor(
    private authService:AuthService, 
    private router:Router, 
    private lodingCtrl:LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }
  authenticate(email: string, password: string){
    this.isLoading = true;
    //this.authService.login();
    this.lodingCtrl
    .create({keyboardClose:true, message:'Loginng in...'})
    .then(loadinEL=>{
      loadinEL.present(); // present Loader then start timer for x sec
      let authObs: Observable<AuthResponseData>;
      if(this.isLogin){
        authObs = this.authService.login(email,password);
      } else{
        authObs = this.authService.signUp(email,password);
      }
      authObs.subscribe(
        resData=>{
          console.log(resData);
          this.isLoading = true;
          loadinEL.dismiss();
          this.router.navigateByUrl('/places/tabs/discover');
      },
      errRes=>{
        console.log(errRes);
        loadinEL.dismiss();
            const code = errRes.error.error.message;
            let message = 'Could not sign you up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email address exists already!';
            }else if(code === 'EMAIL_NOT_FOUND'){
              message = 'There is no user record corresponding to this identifier!';
            }else if(code === 'INVALID_PASSWORD'){
              message = 'The password is invalid or the user does not have a password.!';
            }
            this.showAlert(message);
      });
    });

  }
  onSwitchAuthMode(){
    this.isLogin = !this.isLogin;
  }
  onSubmit(form:NgForm){
    if(!form.valid)
    {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    form.reset();
    

  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}

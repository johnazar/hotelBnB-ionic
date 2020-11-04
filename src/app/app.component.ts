import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
//import { SplashScreen } from '@ionic-native/splash-screen/ngx';
//import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

import{Plugins, Capacitor,AppState }from'@capacitor/core';
import { from, Subscription } from 'rxjs';
import { take} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy{
  private authSub:Subscription;
  private previousAuthStat =false;
  constructor(
    private platform: Platform,
    //private splashScreen: SplashScreen,
    //private statusBar: StatusBar,
    private authService:AuthService,
    private router:Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(Capacitor.isPluginAvailable('SplashScreen')){
        Plugins.SplashScreen.hide();
      }
      /* this.statusBar.styleDefault();
      this.splashScreen.hide(); */
    });
  }
  ngOnInit(){
this.authSub= this.authService.userIsAuth.subscribe(isAuth=>{
  if(!isAuth && this.previousAuthStat !==isAuth)
  {this.router.navigateByUrl('auth');}
  this.previousAuthStat == isAuth;
});
Plugins.App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  }
  ngOnDestroy(){
    if(this.authSub){
      this.authSub.unsubscribe();
    }
  }
  onLogout(){
    this.authService.logout();
    //this.router.navigateByUrl('auth');
  }
  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}

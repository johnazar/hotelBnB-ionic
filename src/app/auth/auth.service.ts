import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { EmailValidator } from '@angular/forms';
import { BehaviorSubject, from} from 'rxjs';
import { map, tap} from 'rxjs/operators';
import{environment} from '../../environments/environment';
import {User}from './user.model'
import{Plugins}from '@capacitor/core'

export interface AuthResponseData{
  kind:string,
  idToken:string ,//A Firebase Auth ID token for the authenticated user.
  email: string,	//The email for the authenticated user.
  refreshToken: string, //	A Firebase Auth refresh token for the authenticated user.
  localId	:string,	//The uid of the authenticated user.
  expiresIn:	string,	//The number of seconds in which the ID token expires.
  registered?:boolean,	//Whether the email is for an existing account. Optional field
}

//login: eng.johnazar@gmail.com
//pass: ahsgsdf

//user demo@demo.com
//password Hgsrwcvda

//keystore password: 123456789bnb
@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
private _user = new BehaviorSubject<User>(null);
private activeLogoutTimer:any;
get userIsAuth(){
  return this._user.asObservable().pipe(map(user => (user)?!!user.token:false)); // !! to convertto boolean
}
get userId(){
  return this._user.asObservable().pipe(map(user => (user)?user.id:null));
}
get token(){
  return this._user.asObservable().pipe(map(user => (user)?user.token:null));

}

  constructor(private http:HttpClient) { }
  autoLogin(){
    return from (Plugins.Storage.get({key:'authData'})).pipe(map(storedData =>{
      if(!storedData || !storedData.value)
      {
        return null;
      }
      const parsedData = JSON.parse(storedData.value) as {userId:string,email:string, token:string, tokenExirationdate:string};
      const expirationDate = new Date(parsedData.tokenExirationdate);
      if(expirationDate<= new Date()){
        return null;
      }
      const user = new User(parsedData.userId,parsedData.email,parsedData.token,expirationDate);
      return user;
    }),tap(user=>{
      if(user){
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
      }
    }
      
    
    ),map(user=> {return !!user;})
    );
  }


  signUp(email:string, password:string){
    console.log('Sending firebase request');
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseapike}`,{
      email: email, password: password,returnSecureToken: true
    }).pipe(tap(this.setUserData.bind(this)));
  }


  login(email:string, password:string){
    //this._userIsAuth = true;
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseapike}`,
    {
      email:email,
      password:password,
      returnSecureToken:true
    }).pipe(tap(this.setUserData.bind(this)));;
  }


  logout(){
    if(this.activeLogoutTimer)
    {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    
    Plugins.Storage.remove({key:'authData'});
  }
  private autoLogout(duration:number){
    if(this.activeLogoutTimer)
    {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(()=>{
      this.logout();
    },duration)


  }
  private setUserData(userData :AuthResponseData){
    const expirationTime = new Date(new Date().getTime()+ (+userData.expiresIn*1000));
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    ) 
    this._user.next(user);
    this.autoLogout(user.tokenDuration);

    this.storeAuthData(userData.localId,userData.email,userData.idToken,expirationTime.toISOString());
  }
  private storeAuthData(userId:string,email:string,token:string, tokenExirationdate:string){
    const data = JSON.stringify({
      userId:userId,
      email:email,
      token:token,
      tokenExirationdate:tokenExirationdate
    });
    Plugins.Storage.set({
      key:'authData',value:data
    })
  }
  ngOnDestroy(){
    if(this.activeLogoutTimer)
    {
      clearTimeout(this.activeLogoutTimer);
    }
  }
}

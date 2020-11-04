import { Injectable } from '@angular/core';
import { CanLoad, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take,tap } from 'rxjs/operators';
import { Route } from '@angular/compiler/src/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor (private authService:AuthService,private router:Router){}
  canLoad
  (route: Route, 
  segments: UrlSegment[]
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.authService.userIsAuth.pipe(
      take(1),
      switchMap(isAuth=>{
        if(!isAuth){
          return this.authService.autoLogin();
        }else{
          return of(isAuth); // pass is Auth as observable
        }
      }),
      tap(
      isAuth =>{
        if(!isAuth){
          this.router.navigateByUrl('/auth');
        }
      }
    ));
  }

  
}

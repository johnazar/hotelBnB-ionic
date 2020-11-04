import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject,of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';
import { tokenName } from '@angular/compiler';

// make interface to data from firebase
interface PlaceData {
  availabeFrom: string;
  availabetill: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location:PlaceLocation;

}

// the app url from firebase
const appUrl = 'https://ionic-angular-course-c774b.firebaseio.com/offer-places';
@Injectable({
  providedIn: 'root'
})

export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([]);
  constructor(private authService: AuthService, private http: HttpClient) { } // keep  constructor first!


  get places() {
    return this._places.asObservable();
  }

  getPlace(id: string) {
    return this.authService.token.pipe(take(1),switchMap(token=>{
      return this.http
      .get<PlaceData>(
        `https://ionic-angular-course-c774b.firebaseio.com/offer-places/${id}.json?auth=${token}`
      )

    }),
        map(responsePlaceData=>{
          return new Place(
            id,
            responsePlaceData.title,
            responsePlaceData.description,
            responsePlaceData.imageUrl,
            responsePlaceData.price,
            new Date(responsePlaceData.availabeFrom),
            new Date(responsePlaceData.availabetill),
            responsePlaceData.userId,
            responsePlaceData.location

          )
        })
      );
    /* return this.places.pipe(take(1), map(pl=>{
      return { ...pl.find(p => p.id === id)};

    })); */

  }
  // hint: use tap insdide pipe to check the resulte in console

  fetchPlaces() {
    return this.authService.token.pipe(take(1),switchMap(token=>{
      return this.http
      /* the http get returns key that we dont know with PlaceData - Place without ID
      so define thr respone data */
      .get<{ [key: string]: PlaceData }>(appUrl + `.json?auth=${token}`)
    }),
        //map return non observable object so use it later
        map(
          resData => {
            const tempplaces = [];
            for (const key in resData) {
              if (resData.hasOwnProperty(key)) {
                tempplaces.push(new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availabeFrom),
                  new Date(resData[key].availabetill),
                  resData[key].userId,
                  resData[key].location
                ));
              }
            }
            return tempplaces;
            // empty array to test no place were found
            //return [];

          }),
        tap(temp_places => {
          this._places.next(temp_places);
        })
      );
  }
  uploadImage(image : File){
    const uplaodData = new FormData;
    uplaodData.append('image',image);
    return this.authService.token.pipe(take(1),switchMap(token=>{
      return this.http.post<{imageUrl: string, imagePath: string}>
      ('https://us-central1-ionic-angular-course-c774b.cloudfunctions.net/storeImage',
      uplaodData, { headers: {Authorization: 'Bearer '+ token } });
    }))
    
  }
  addPlace(
    title: string,
    desc: string,
    price: number,
    datefrom: Date,
    datetill: Date,
    location:PlaceLocation,
    imageUrl: string
    ) {
    let generatedID: string;
    let fetchedUserId:string;
    let newPlace:Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId=>{
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token=>{
        if(!fetchedUserId){
          throw new Error('No user id found');
    }
    newPlace = new Place(
      Math.random().toString(),
      title, 
      desc,
      imageUrl,
      price,
      datefrom,
      datetill,
      fetchedUserId,
      location);
    // create  place in firebase we will send the same object without the id
    // the id will be added at firebase
    return this.http
      // post method recive a string from firebase as response and override id 
      .post<{ name: string }>(appUrl + `.json?auth=${token}`, { ...newPlace, id: null });

    }),switchMap(resData => {
          //get the new ID and store it
          generatedID = resData.name;
          return this.places
        }),
        take(1),
        tap(pl => {
          // change the id of the new places
          newPlace.id = generatedID;
          // add the new place
          this._places.next(pl.concat(newPlace));
        }
      ));
    /*     return this.places.pipe(take(1),delay (1000), tap(pl =>{
     
            this._places.next(pl.concat(newPlace));
    
        })); */
  }
  updatePlace(placeID: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken:string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token=>{
        fetchedToken=token;
        return this.places;

      }),
      take(1),
      switchMap(placess => {
        if(!placess||placess.length<=0){
          return this.fetchPlaces();

        }
        else{
          return of(placess);
        }
      }),
      switchMap(placesList=>{
        const updatedplaceIndex = placesList.findIndex(pl => pl.id === placeID);
        const updatedPlaces = [...placesList];
        const oldPlace = updatedPlaces[updatedplaceIndex];
        updatedPlaces[updatedplaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availabeFrom,
          oldPlace.availabetill,
          oldPlace.userId,
          oldPlace.location);

        return this.http.put(
          `https://ionic-angular-course-c774b.firebaseio.com/offer-places/${placeID}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedplaceIndex], id: null });
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );


    //take will get the latest
    /*  return this.places.pipe(
       take(1),
       delay(1000),
       tap(pl=>{
       const updatedplaceIndex = pl.findIndex(pl=>pl.id===placeID);
       const updatedPlaces = [...pl];
       const oldPlace = updatedPlaces[updatedplaceIndex];
       updatedPlaces[updatedplaceIndex] = new Place(
         oldPlace.id,
         title,
         description,
         oldPlace.imageUrl,
         oldPlace.price,
         oldPlace.availabeFrom,
         oldPlace.availabetill,
         oldPlace.userId
       );
       this._places.next(updatedPlaces)
 
     })); */
  }

}

/*

    new Place (
      'p1',
      'The Title 1',
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form,',
      'https://via.placeholder.com/300.png',
      150,
      new Date('2020-05-05'),
      new Date('2020-12-12'),'ab'
    ),
    new Place (
      'p2',
      'The Title 2',
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form,',
      'https://via.placeholder.com/300.png',
      152,new Date('2020-05-05'),
      new Date('2020-12-12'),'abs'
    )
    ,
    new Place (
      'p3',
      'The Title 3',
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form,',
      'https://via.placeholder.com/300.png',
      152,
      new Date('2020-05-05'),
      new Date('2020-12-12'),'abs'
    )

*/

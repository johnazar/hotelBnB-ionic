import { Injectable } from '@angular/core';
import {Booking} from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, tap, delay ,switchMap,map} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceDetailPage } from '../places/discover/place-detail/place-detail.page';

// helper interface
interface BookinData{
    bookedFrom: string;
    bookedTo: string;
    gustNumber: number;
    firstName: string;
    lastName: string;
    palceImge: string;
    placeId: string;
    placeTitle: string;
    userId: string;
}

@Injectable({providedIn: 'root'})
export class BookingService{
    private _bookings = new BehaviorSubject<Booking[]>([]);
    constructor (
        private authServ:AuthService,
        private http: HttpClient){}

    get bookings () {
        return this._bookings.asObservable();
    }
    addBooking(placeId:string,placeTitle:string,palceImg:string,firstName:string,lastName:string, gustNumber:number,bookedFrom:Date, bookedTo:Date){
        let generatedId:string;
        let newBooking:Booking;
        let fetchedUserId:string;
        return this.authServ.userId.pipe(
            take(1),
            switchMap(userId =>{
            if(!userId){
                throw new Error('No user id found');
            }
            fetchedUserId=userId;
            return this.authServ.token;
        }),
        take(1),
        switchMap(token=>{
            newBooking =new Booking (
                Math.random().toString(),
                placeId,
                fetchedUserId,
                placeTitle,
                palceImg,
                firstName,
                lastName,
                gustNumber,
                bookedFrom,
                bookedTo);
                return this.http.post<{name: string}>(
                    `https://ionic-angular-course-c774b.firebaseio.com/bookings.json?auth=${token}`,
                        {...newBooking,id:null})

        }),
        switchMap( resData => {
                generatedId= resData.name;
                return this.bookings;
                }),
                take(1), // operter take will return the last valid value otherwise will be ongoing subscription
                tap(bookings =>{
                    newBooking.id =generatedId;
                    this._bookings.next(bookings.concat(newBooking))
                })
            );
    }
    cancelBooking(bookingId: string) {
        return this.authServ.token.pipe(
            take(1),
            switchMap(token=>{
                return this.http.delete(
                    `https://ionic-angular-course-c774b.firebaseio.com/bookings/${bookingId}.json?auth=${token}`)

            }),
            switchMap(()=>{
                return this.bookings;
            }),
            take(1),
            tap( bookings =>{
                this._bookings.next(bookings.filter(b => b.id !== bookingId));
            })
            );

       /*  return this.bookings.pipe(
          take(1),
          delay(1000),
          tap(bookings => {
              //filter out booking to delete it from list
            this._bookings.next(bookings.filter(b => b.id !== bookingId));
          })
        ); */
      }

    fetchBooking(){
        let fetchedUserId:string;
        return this.authServ.userId.pipe(take(1),switchMap(userId=>{
            if(!userId){
                throw new Error('No user id found');
            }
            fetchedUserId=userId;
            return this.authServ.token;
        }),
        take(1),
        switchMap(token=>{
            return this.http
            .get<{[key: string]: BookinData}>(`https://ionic-angular-course-c774b.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
                fetchedUserId
                }"&auth=${token}`);
        }), map(bookingData => {
                    const bookin =[];
                        for (const key in bookingData)
                        {
                            if(bookingData.hasOwnProperty(key)){
                                bookin.push(
                                    new Booking(
                                        key,
                                        bookingData[key].placeId,
                                        bookingData[key].userId,
                                        bookingData[key].placeTitle,
                                        bookingData[key].palceImge,
                                        bookingData[key].firstName,
                                        bookingData[key].lastName,
                                        bookingData[key].gustNumber,
                                        new Date(bookingData[key].bookedFrom),
                                        new Date(bookingData[key].bookedTo),
                                        )
                                    );
                            }
                        }
                    return bookin;
                }),
                // add booking that we recived to booking list
                tap(bookings => {
                    this._bookings.next(bookings);
                })
                );
    }

}
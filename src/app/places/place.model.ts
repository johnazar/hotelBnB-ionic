import { PlaceLocation } from './location.model';

export class Place {
    constructor (
        public id:string,
        public title: string,
        public description:string,
        public imageUrl: string,
        public price: number,
        public availabeFrom:Date,
        public availabetill:Date,
        public userId: string,
        public location:PlaceLocation

    ){}
}
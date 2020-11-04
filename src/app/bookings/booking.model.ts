export class Booking {
    constructor (
        public id:string,
        public placeId:string,
        public userId:string,
        public placeTitle: string,
        public palceImge:string,
        public firstName:string,
        public lastName:string, 
        public gustNumber:number,
        public bookedFrom:Date, 
        public bookedTo:Date
        ){

        }
}
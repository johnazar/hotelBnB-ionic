export class User{
    constructor (
        public id:string,
        public email:string,
        private _token:string,
        private tokenExpirationData:Date){}
    get token(){
      if(!this.tokenExpirationData || this.tokenExpirationData<= new Date()) {
          return null;
      }
      return this._token;
    }
    get tokenDuration(){
        if(!this.token){
            return 0;
        }
        //return 2000;
        return  this.tokenExpirationData.getTime() -new Date().getTime();
    }
}
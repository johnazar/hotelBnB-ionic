import { Component, OnInit, Output,EventEmitter, ViewChild, ElementRef, Input  } from '@angular/core';
import{CameraResultType, CameraSource, Capacitor, Plugins} from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { from } from 'rxjs';


@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview =false;
  selectedImage:string;
  usePicker = false;
  constructor(private platform:Platform) { }

  ngOnInit() {
    console.log('Mobile:',this.platform.is('mobile'));
    console.log('Hybrid:',this.platform.is('hybrid'));
    console.log('iOS:',this.platform.is('ios'));
    console.log('Android:',this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));
    if((this.platform.is('mobile')&&!this.platform.is('hybrid'))||
    this.platform.is('desktop')
    )
    {
      this.usePicker = true;
    }
  }
  onPickImage(){
    if(!Capacitor.isPluginAvailable('Camera')){
this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation:true,
      height:320,
      width:200,
      resultType:CameraResultType.DataUrl
    })
    .then(image=>{
      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);

    })
    .catch(err=>{
      console.log(err);
      // use a file picker
      if(this.usePicker){
        this.filePickerRef.nativeElement.click();
      }
      
      return false;
    });

  }
  onFileChosen(event: Event){
    console.log(event);
    const picedFile = (event.target as HTMLInputElement).files[0];
    if(!picedFile){
      return;
    }
    const fileRedaer = new FileReader();
    fileRedaer.onload = ()=>{
      const dataUrl = fileRedaer.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(picedFile);
    };
    fileRedaer.readAsDataURL(picedFile);
    
  }

}

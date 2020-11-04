import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { CommonModule } from '@angular/common';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';

// new main branch

@NgModule({

    declarations:[ LocationPickerComponent, MapModalComponent, ImagePickerComponent],
    imports: [CommonModule, IonicModule ],
    exports :[ LocationPickerComponent, MapModalComponent, ImagePickerComponent],
    entryComponents:[MapModalComponent]


})
export class SharedModule{}
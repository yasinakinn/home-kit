import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddDevicePage } from './add-device.page';

describe('AddDevicePage', () => {
  let component: AddDevicePage;
  let fixture: ComponentFixture<AddDevicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDevicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddDevicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

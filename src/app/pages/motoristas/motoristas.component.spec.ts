import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotoristasComponent } from './motoristas.component';

describe('MotoristasComponent', () => {
  let component: MotoristasComponent;
  let fixture: ComponentFixture<MotoristasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotoristasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MotoristasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

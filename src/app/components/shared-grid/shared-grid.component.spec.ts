import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedGridComponent } from './shared-grid.component';

describe('SharedGridComponent', () => {
  let component: SharedGridComponent;
  let fixture: ComponentFixture<SharedGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

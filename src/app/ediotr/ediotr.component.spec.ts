import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdiotrComponent } from './ediotr.component';

describe('EdiotrComponent', () => {
  let component: EdiotrComponent;
  let fixture: ComponentFixture<EdiotrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdiotrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdiotrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

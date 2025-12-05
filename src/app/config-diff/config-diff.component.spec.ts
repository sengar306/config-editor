import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigDiffComponent } from './config-diff.component';

describe('ConfigDiffComponent', () => {
  let component: ConfigDiffComponent;
  let fixture: ComponentFixture<ConfigDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigDiffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SushiListComponent } from './sushi-list.component';

describe('SushiListComponent', () => {
  let component: SushiListComponent;
  let fixture: ComponentFixture<SushiListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SushiListComponent]
    });
    fixture = TestBed.createComponent(SushiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

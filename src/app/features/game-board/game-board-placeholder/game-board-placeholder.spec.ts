import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBoardPlaceholder } from './game-board-placeholder';

// Covers: FR-1.4 (game-board route target screen content)

describe('GameBoardPlaceholder', () => {
  let component: GameBoardPlaceholder;
  let fixture: ComponentFixture<GameBoardPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardPlaceholder);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders a placeholder message for the upcoming game board screen', () => {
    expect(component).toBeTruthy();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Partida en construccion');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MatchOverOverlay } from './match-over-overlay';

// Covers: FR-3.2, FR-3.3, FR-3.4, FR-3.5, FR-4.1, FR-5.1, FR-6.2, US-2, US-3, US-4
// BDD Scenarios: SC-17, SC-18, SC-19, SC-20, SC-21, SC-22, SC-25, SC-28, SC-29, SC-34, SC-35

interface MatchScoreEntry {
  playerName: string;
  score: number;
}

interface MatchOverOverlayOutputRefs {
  returnToLobby: { emit: () => void };
  playAgain: { emit: () => void };
}

describe('MatchOverOverlay', () => {
  let fixture: ComponentFixture<MatchOverOverlay>;
  let component: MatchOverOverlay;

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const setInputs = async (winnerNames: string[], matchScoreEntries: MatchScoreEntry[]) => {
    fixture.componentRef.setInput('winnerNames', winnerNames);
    fixture.componentRef.setInput('matchScoreEntries', matchScoreEntries);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchOverOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchOverOverlay);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('SC-25 / FR-6.2 - renders modal dialog semantics with an accessible name', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const overlay = getByTestId<HTMLElement>('match-over-overlay');
    const heading = getByTestId<HTMLElement>('match-over-title');

    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
    expect(overlay.getAttribute('aria-labelledby')).toBe('match-over-title');
    expect((heading.textContent ?? '').trim()).toBe('Partida terminada');
  });

  it('SC-17 / FR-3.2 - renders overlay viewport shell with full-screen class hooks', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const overlay = getByTestId<HTMLElement>('match-over-overlay');

    expect(overlay.classList.contains('match-over-overlay')).toBe(true);
  });

  it('SC-18 / FR-3.3 - renders sole winner name prominently', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const winnerName = getByTestId<HTMLElement>('winner-name-0');

    expect((winnerName.textContent ?? '').trim()).toBe('Ana');
  });

  it('SC-19 / FR-3.3 - renders all co-winner names with equal presentation hooks', async () => {
    await setInputs(
      ['Ana', 'Luis'],
      [
        { playerName: 'Ana', score: 16 },
        { playerName: 'Luis', score: 16 },
      ],
    );

    const winnerItems = fixture.nativeElement.querySelectorAll(
      '[data-testid^="winner-name-"]',
    ) as NodeListOf<HTMLElement>;

    expect(winnerItems.length).toBe(2);
    expect((winnerItems[0]?.textContent ?? '').trim()).toBe('Ana');
    expect((winnerItems[1]?.textContent ?? '').trim()).toBe('Luis');
    expect(winnerItems[0]?.className).toBe(winnerItems[1]?.className);
  });

  it('SC-20 / FR-3.4 - renders accumulated match scores for all players', async () => {
    await setInputs(
      ['Ana'],
      [
        { playerName: 'Ana', score: 18 },
        { playerName: 'Luis', score: 14 },
      ],
    );

    const scoreRows = fixture.nativeElement.querySelectorAll(
      '[data-testid^="match-score-row-"]',
    ) as NodeListOf<HTMLElement>;

    expect(scoreRows.length).toBe(2);
    expect((scoreRows[0]?.textContent ?? '').trim()).toContain('Ana');
    expect((scoreRows[0]?.textContent ?? '').trim()).toContain('18');
    expect((scoreRows[1]?.textContent ?? '').trim()).toContain('Luis');
    expect((scoreRows[1]?.textContent ?? '').trim()).toContain('14');
  });

  it('SC-28 / SC-34 - renders explicit lobby and rematch actions with Spanish labels', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const returnToLobbyButton = getByTestId<HTMLButtonElement>('return-to-lobby-button');
    const playAgainButton = getByTestId<HTMLButtonElement>('play-again-button');

    expect((returnToLobbyButton.textContent ?? '').trim()).toBe('Volver al lobby');
    expect(returnToLobbyButton.getAttribute('aria-label')).toBe('Volver al lobby');
    expect((playAgainButton.textContent ?? '').trim()).toBe('Jugar de nuevo');
    expect(playAgainButton.getAttribute('aria-label')).toBe('Jugar de nuevo');
  });

  it('SC-29 - emits returnToLobby output when lobby action is activated', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const outputRefs = component as unknown as MatchOverOverlayOutputRefs;
    const returnToLobbyEmitSpy = vi.spyOn(outputRefs.returnToLobby, 'emit');
    const button = getByTestId<HTMLButtonElement>('return-to-lobby-button');

    button.click();
    await fixture.whenStable();

    expect(returnToLobbyEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-35 - emits playAgain output when rematch action is activated', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const outputRefs = component as unknown as MatchOverOverlayOutputRefs;
    const playAgainEmitSpy = vi.spyOn(outputRefs.playAgain, 'emit');
    const button = getByTestId<HTMLButtonElement>('play-again-button');

    button.click();
    await fixture.whenStable();

    expect(playAgainEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-21 / FR-3.5 - does not emit any output when Escape is pressed', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const outputRefs = component as unknown as MatchOverOverlayOutputRefs;
    const returnToLobbyEmitSpy = vi.spyOn(outputRefs.returnToLobby, 'emit');
    const playAgainEmitSpy = vi.spyOn(outputRefs.playAgain, 'emit');
    const overlay = getByTestId<HTMLElement>('match-over-overlay');

    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(returnToLobbyEmitSpy).not.toHaveBeenCalled();
    expect(playAgainEmitSpy).not.toHaveBeenCalled();
    expect(getByTestId<HTMLElement>('match-over-overlay')).not.toBeNull();
  });

  it('SC-22 / FR-3.5 - does not emit any output when clicking overlay backdrop shell', async () => {
    await setInputs(['Ana'], [{ playerName: 'Ana', score: 18 }]);

    const outputRefs = component as unknown as MatchOverOverlayOutputRefs;
    const returnToLobbyEmitSpy = vi.spyOn(outputRefs.returnToLobby, 'emit');
    const playAgainEmitSpy = vi.spyOn(outputRefs.playAgain, 'emit');
    const overlay = getByTestId<HTMLElement>('match-over-overlay');

    overlay.click();
    await fixture.whenStable();

    expect(returnToLobbyEmitSpy).not.toHaveBeenCalled();
    expect(playAgainEmitSpy).not.toHaveBeenCalled();
    expect(getByTestId<HTMLElement>('match-over-overlay')).not.toBeNull();
  });
});

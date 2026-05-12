import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { GameSession } from '../../../core/services/game-session';

import { Lobby } from './lobby';

// Covers: FR-2.1, FR-3.3, FR-3.4, FR-4.2, FR-4.5, FR-5.3, FR-5.5, FR-6.3,
// FR-7.2, FR-7.4, FR-7.5, US-2, US-3, US-4, US-6, US-7
interface LobbyConfiguration {
  mode: 'Single Player' | 'Multiplayer';
  playerNames: string[];
  playerCount: 2 | 3 | 4;
  aiDifficulty: 'Easy' | 'Medium' | 'Hard';
}

interface RouterPort {
  navigate: (commands: unknown[]) => Promise<boolean>;
}

interface SessionPort {
  configuration: () => LobbyConfiguration | null;
  setConfiguration: (configuration: LobbyConfiguration) => void;
}

describe('Lobby', () => {
  let component: Lobby;
  let fixture: ComponentFixture<Lobby>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let setConfigurationSpy: ReturnType<typeof vi.fn>;

  const queryByTestId = <T extends HTMLElement>(testId: string): T | null =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  const setInputValue = (element: HTMLInputElement, value: string): void => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const setSelectValue = (element: HTMLSelectElement, value: string): void => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  beforeEach(async () => {
    navigateSpy = vi.fn().mockResolvedValue(true);
    setConfigurationSpy = vi.fn();
    const configurationSignal = signal<LobbyConfiguration | null>(null);

    const routerStub: RouterPort = {
      navigate: navigateSpy as unknown as RouterPort['navigate'],
    };

    const sessionStub: SessionPort = {
      configuration: configurationSignal.asReadonly(),
      setConfiguration: setConfigurationSpy as unknown as SessionPort['setConfiguration'],
    };

    await TestBed.configureTestingModule({
      imports: [Lobby],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: GameSession, useValue: sessionStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Lobby);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the hero title and decorative element', () => {
    expect(component).toBeTruthy();

    const heading = fixture.nativeElement.querySelector('h1') as HTMLElement | null;
    expect(heading).not.toBeNull();
    expect(heading?.textContent ?? '').toContain('La Escobini Kapitxorna');
    expect(queryByTestId('hero-decoration')).not.toBeNull();
  });

  it('starts in single player mode by default', () => {
    const singlePlayerMode = queryByTestId<HTMLInputElement>('mode-single');
    const multiplayerMode = queryByTestId<HTMLInputElement>('mode-multiplayer');

    expect(singlePlayerMode).not.toBeNull();
    expect(singlePlayerMode?.checked).toBe(true);
    expect(multiplayerMode).not.toBeNull();
    expect(multiplayerMode?.checked).toBe(false);
  });

  it('shows single player setup defaults on first load', () => {
    const singleNameInput = queryByTestId<HTMLInputElement>('single-player-name');
    const aiName = queryByTestId<HTMLElement>('ai-name');
    const aiDifficulty = queryByTestId<HTMLSelectElement>('ai-difficulty');

    expect(singleNameInput).not.toBeNull();
    expect(singleNameInput?.value).toBe('Jugador-1');
    expect(aiName).not.toBeNull();
    expect(aiName?.textContent ?? '').toContain('Laia');
    expect(aiDifficulty).not.toBeNull();
    expect(aiDifficulty?.value).toBe('Easy');
    expect(queryByTestId('player-count')).toBeNull();
  });

  it('switches to multiplayer fields and hides AI controls', async () => {
    const multiplayerMode = queryByTestId<HTMLInputElement>('mode-multiplayer');
    expect(multiplayerMode).not.toBeNull();

    multiplayerMode?.click();
    await fixture.whenStable();

    const playerCount = queryByTestId<HTMLSelectElement>('player-count');
    const playerOne = queryByTestId<HTMLInputElement>('multiplayer-name-1');
    const playerTwo = queryByTestId<HTMLInputElement>('multiplayer-name-2');

    expect(playerCount).not.toBeNull();
    expect(playerCount?.value).toBe('2');
    expect(playerOne?.value).toBe('Jugador-1');
    expect(playerTwo?.value).toBe('Jugador-2');
    expect(queryByTestId('ai-difficulty')).toBeNull();
    expect(queryByTestId('ai-name')).toBeNull();
  });

  it('preserves multiplayer names when reducing player count', async () => {
    const multiplayerMode = queryByTestId<HTMLInputElement>('mode-multiplayer');
    multiplayerMode?.click();
    await fixture.whenStable();

    const playerCount = queryByTestId<HTMLSelectElement>('player-count');
    const playerOne = queryByTestId<HTMLInputElement>('multiplayer-name-1');
    const playerTwo = queryByTestId<HTMLInputElement>('multiplayer-name-2');

    expect(playerCount).not.toBeNull();
    expect(playerOne).not.toBeNull();
    expect(playerTwo).not.toBeNull();

    if (!playerCount || !playerOne || !playerTwo) {
      throw new Error('Expected multiplayer controls to be available');
    }

    setInputValue(playerOne, 'Ana');
    setInputValue(playerTwo, 'Luis');
    setSelectValue(playerCount, '3');
    await fixture.whenStable();

    expect(queryByTestId<HTMLInputElement>('multiplayer-name-3')?.value).toBe('Jugador-3');

    setSelectValue(playerCount, '2');
    await fixture.whenStable();

    expect(queryByTestId<HTMLInputElement>('multiplayer-name-1')?.value).toBe('Ana');
    expect(queryByTestId<HTMLInputElement>('multiplayer-name-2')?.value).toBe('Luis');
    expect(queryByTestId('multiplayer-name-3')).toBeNull();
  });

  it('keeps single player name but resets AI difficulty after switching modes', async () => {
    const singleNameInput = queryByTestId<HTMLInputElement>('single-player-name');
    const aiDifficulty = queryByTestId<HTMLSelectElement>('ai-difficulty');
    const multiplayerMode = queryByTestId<HTMLInputElement>('mode-multiplayer');
    const singleMode = queryByTestId<HTMLInputElement>('mode-single');

    expect(singleNameInput).not.toBeNull();
    expect(aiDifficulty).not.toBeNull();
    expect(multiplayerMode).not.toBeNull();
    expect(singleMode).not.toBeNull();

    if (!singleNameInput || !aiDifficulty || !multiplayerMode || !singleMode) {
      throw new Error('Expected single player controls to be available');
    }

    setInputValue(singleNameInput, 'Carlos');
    setSelectValue(aiDifficulty, 'Hard');

    multiplayerMode.click();
    await fixture.whenStable();

    singleMode.click();
    await fixture.whenStable();

    expect(queryByTestId<HTMLInputElement>('single-player-name')?.value).toBe('Carlos');
    expect(queryByTestId<HTMLSelectElement>('ai-difficulty')?.value).toBe('Easy');
  });

  it('shows a Spanish validation message on blur and disables play when name is empty', async () => {
    const singleNameInput = queryByTestId<HTMLInputElement>('single-player-name');
    const playButton = queryByTestId<HTMLButtonElement>('play-button');

    expect(singleNameInput).not.toBeNull();
    expect(playButton).not.toBeNull();

    if (!singleNameInput || !playButton) {
      throw new Error('Expected primary form controls to be available');
    }

    setInputValue(singleNameInput, '');
    singleNameInput.dispatchEvent(new Event('blur', { bubbles: true }));
    await fixture.whenStable();

    const validationMessage = queryByTestId<HTMLElement>('single-player-name-error');
    expect(validationMessage).not.toBeNull();
    expect(validationMessage?.textContent?.toLowerCase()).toContain('nombre');
    expect(playButton.disabled).toBe(true);
  });

  it('clears validation message while typing and enables play again', async () => {
    const singleNameInput = queryByTestId<HTMLInputElement>('single-player-name');
    const playButton = queryByTestId<HTMLButtonElement>('play-button');

    expect(singleNameInput).not.toBeNull();
    expect(playButton).not.toBeNull();

    if (!singleNameInput || !playButton) {
      throw new Error('Expected primary form controls to be available');
    }

    setInputValue(singleNameInput, '');
    singleNameInput.dispatchEvent(new Event('blur', { bubbles: true }));
    await fixture.whenStable();

    setInputValue(singleNameInput, 'Ana');
    await fixture.whenStable();

    expect(queryByTestId('single-player-name-error')).toBeNull();
    expect(playButton.disabled).toBe(false);
  });

  it('stores configuration and navigates to the game board when pressing Jugar', async () => {
    const playButton = queryByTestId<HTMLButtonElement>('play-button');
    expect(playButton).not.toBeNull();

    playButton?.click();
    await fixture.whenStable();

    expect(setConfigurationSpy).toHaveBeenCalledWith({
      mode: 'Single Player',
      playerNames: ['Jugador-1'],
      playerCount: 2,
      aiDifficulty: 'Easy',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/partida']);
  });

  it('does not navigate when the form is invalid', async () => {
    const singleNameInput = queryByTestId<HTMLInputElement>('single-player-name');
    const playButton = queryByTestId<HTMLButtonElement>('play-button');

    expect(singleNameInput).not.toBeNull();
    expect(playButton).not.toBeNull();

    if (!singleNameInput || !playButton) {
      throw new Error('Expected primary form controls to be available');
    }

    setInputValue(singleNameInput, '');
    singleNameInput.dispatchEvent(new Event('blur', { bubbles: true }));
    await fixture.whenStable();

    playButton.click();
    await fixture.whenStable();

    expect(setConfigurationSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});

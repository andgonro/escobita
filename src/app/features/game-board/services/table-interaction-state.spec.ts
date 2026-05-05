import { TestBed } from '@angular/core/testing';
import { Card } from '../../../models/card';

import { TableInteractionState } from './table-interaction-state';

// Covers: FR-3.2, FR-3.3, FR-4.1, FR-4.2, FR-5.2, FR-5.6, TR-2.2, US-3, US-4, US-5

interface TableInteractionStateContract {
  selectedHandCard: () => Card | null;
  selectedTableCards: () => Card[];
  isCaptureSelectionValid: () => boolean;
  canSubmitPlay: () => boolean;
  handoffEnabled: () => boolean;
  selectHandCard(card: Card): void;
  clearSelectedHandCard(): void;
  toggleTableCard(card: Card): void;
  clearSelectedTableCards(): void;
  setHandoffEnabled(enabled: boolean): void;
  resetForNextAction(): void;
}

const card7Oros: Card = { suit: 'Oros', rank: '7', value: 7 };
const card1Copas: Card = { suit: 'Copas', rank: '1', value: 1 };
const card5Espadas: Card = { suit: 'Espadas', rank: '5', value: 5 };
const card3Bastos: Card = { suit: 'Bastos', rank: '3', value: 3 };
const card4Copas: Card = { suit: 'Copas', rank: '4', value: 4 };

function asContract(service: TableInteractionState): TableInteractionStateContract {
  return service as unknown as TableInteractionStateContract;
}

describe('TableInteractionState', () => {
  let service: TableInteractionState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableInteractionState],
    });
    service = TestBed.inject(TableInteractionState);
  });

  it('SC-08 / FR-3.3 - starts with empty selection state and disabled submission', () => {
    const interaction = asContract(service);

    expect(interaction.selectedHandCard()).toBeNull();
    expect(interaction.selectedTableCards()).toEqual([]);
    expect(interaction.isCaptureSelectionValid()).toBe(true);
    expect(interaction.canSubmitPlay()).toBe(false);
  });

  it('SC-08 / FR-3.2 - persists hand-card selection until replaced or cleared', () => {
    const interaction = asContract(service);

    interaction.selectHandCard(card7Oros);
    expect(interaction.selectedHandCard()).toEqual(card7Oros);

    interaction.selectHandCard(card1Copas);
    expect(interaction.selectedHandCard()).toEqual(card1Copas);

    interaction.clearSelectedHandCard();
    expect(interaction.selectedHandCard()).toBeNull();
  });

  it('SC-11 / FR-4.1 - toggles capture subset cards on and off without duplicates', () => {
    const interaction = asContract(service);

    interaction.toggleTableCard(card5Espadas);
    interaction.toggleTableCard(card3Bastos);
    interaction.toggleTableCard(card5Espadas);

    expect(interaction.selectedTableCards()).toEqual([card3Bastos]);
  });

  it('SC-12 / FR-4.2 - marks capture as valid when hand card plus subset equals 15', () => {
    const interaction = asContract(service);

    interaction.selectHandCard(card7Oros);
    interaction.toggleTableCard(card5Espadas);
    interaction.toggleTableCard(card3Bastos);

    expect(interaction.isCaptureSelectionValid()).toBe(true);
    expect(interaction.canSubmitPlay()).toBe(true);
  });

  it('SC-12 / FR-4.2 - marks capture as invalid when selected subset does not form 15 with hand card', () => {
    const interaction = asContract(service);

    interaction.selectHandCard(card7Oros);
    interaction.toggleTableCard(card4Copas);
    interaction.toggleTableCard(card3Bastos);

    expect(interaction.isCaptureSelectionValid()).toBe(false);
    expect(interaction.canSubmitPlay()).toBe(false);
  });

  it('SC-13 / FR-4.3 - treats empty subset as placement and allows submission when a hand card is selected', () => {
    const interaction = asContract(service);

    interaction.selectHandCard(card7Oros);

    expect(interaction.selectedTableCards()).toEqual([]);
    expect(interaction.isCaptureSelectionValid()).toBe(true);
    expect(interaction.canSubmitPlay()).toBe(true);
  });

  it('SC-11 / FR-4.1 - clears table-card subset through the dedicated clear action', () => {
    const interaction = asContract(service);

    interaction.toggleTableCard(card5Espadas);
    interaction.toggleTableCard(card3Bastos);
    interaction.clearSelectedTableCards();

    expect(interaction.selectedTableCards()).toEqual([]);
  });

  it('SC-16 / FR-5.2 - stores handoff toggle and preserves enabled state across interaction reset', () => {
    const interaction = asContract(service);

    interaction.setHandoffEnabled(true);
    interaction.selectHandCard(card1Copas);
    interaction.toggleTableCard(card4Copas);

    interaction.resetForNextAction();

    expect(interaction.handoffEnabled()).toBe(true);
    expect(interaction.selectedHandCard()).toBeNull();
    expect(interaction.selectedTableCards()).toEqual([]);
  });

  it('SC-30 / FR-5.6 - preserves disabled handoff state across repeated reset cycles', () => {
    const interaction = asContract(service);

    interaction.setHandoffEnabled(true);
    interaction.setHandoffEnabled(false);

    interaction.selectHandCard(card7Oros);
    interaction.toggleTableCard(card4Copas);
    interaction.resetForNextAction();

    interaction.selectHandCard(card1Copas);
    interaction.toggleTableCard(card3Bastos);
    interaction.resetForNextAction();

    expect(interaction.handoffEnabled()).toBe(false);
    expect(interaction.selectedHandCard()).toBeNull();
    expect(interaction.selectedTableCards()).toEqual([]);
  });
});

import {
  GameEngine,
  createDeck,
  scoreEscobas,
  scoreMostCards,
  scoreMostOros,
  scoreMostSevens,
  scoreSieteDeVelo
} from "./chunk-JX4GWIW6.js";
import {
  ChangeDetectorRef,
  Component,
  GameSession,
  Injectable,
  Injector,
  Input,
  NgZone,
  Output,
  Router,
  __spreadProps,
  __spreadValues,
  computed,
  effect,
  inject,
  output,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵarrowFunction,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-PEZOI2E3.js";

// src/app/core/services/ai-strategy.service.ts
var AiStrategyService = class _AiStrategyService {
  decide(state, aiPlayer, difficulty, randomFn) {
    const pickRandom = randomFn ?? this.secureRandomIndex;
    if (difficulty === "Easy") {
      return this.decideFacil(state, aiPlayer, pickRandom);
    }
    if (difficulty === "Medium") {
      return this.decideIntermedio(state, aiPlayer, pickRandom);
    }
    return this.decideDificil(state, aiPlayer, pickRandom);
  }
  decideFacil(state, aiPlayer, randomFn) {
    const captureOptions = this.getCaptureOptions(aiPlayer.hand, state.table);
    const escobaOptions = this.getEscobaOptions(captureOptions, state.table);
    if (escobaOptions.length > 0) {
      return this.pickOption(escobaOptions, randomFn);
    }
    if (captureOptions.length > 0) {
      return this.pickOption(captureOptions, randomFn);
    }
    return this.decidePlacement(aiPlayer.hand, randomFn);
  }
  decideIntermedio(state, aiPlayer, randomFn) {
    const captureOptions = this.getCaptureOptions(aiPlayer.hand, state.table);
    const escobaOptions = this.getEscobaOptions(captureOptions, state.table);
    if (escobaOptions.length > 0) {
      return this.pickOption(escobaOptions, randomFn);
    }
    if (captureOptions.length > 0) {
      const highestScore = Math.max(...captureOptions.map((option) => this.getHighValueCaptureScore(option.captureSubset)));
      const bestOptions = captureOptions.filter((option) => this.getHighValueCaptureScore(option.captureSubset) === highestScore);
      return this.pickOption(bestOptions, randomFn);
    }
    return this.decidePlacement(aiPlayer.hand, randomFn);
  }
  decideDificil(state, aiPlayer, randomFn) {
    const captureOptions = this.getCaptureOptions(aiPlayer.hand, state.table);
    const escobaOptions = this.getEscobaOptions(captureOptions, state.table);
    if (escobaOptions.length > 0) {
      return this.pickOption(escobaOptions, randomFn);
    }
    if (captureOptions.length > 0) {
      const allCapturedCards = state.players.flatMap((player) => player.capturedPile);
      const unseenCards = this.buildUnseenCards(aiPlayer.hand, state.table, allCapturedCards);
      const opponents = state.players.filter((player) => player.id !== aiPlayer.id);
      const optionScores = captureOptions.map((option) => ({
        option,
        projectedScore: this.getProjectedRoundScore(aiPlayer, opponents, option.captureSubset),
        probabilityScore: this.getProbabilityWeightedScore(option.captureSubset, unseenCards)
      }));
      const highestProjected = Math.max(...optionScores.map((entry) => entry.projectedScore));
      const bestProjected = optionScores.filter((entry) => entry.projectedScore === highestProjected);
      const largestCapture = Math.max(...bestProjected.map((entry) => entry.option.captureSubset.length));
      const bestByCaptureSize = bestProjected.filter((entry) => entry.option.captureSubset.length === largestCapture);
      const highestProbability = Math.max(...bestByCaptureSize.map((entry) => entry.probabilityScore));
      const bestOptions = bestByCaptureSize.filter((entry) => entry.probabilityScore === highestProbability).map((entry) => entry.option);
      return this.pickOption(bestOptions, randomFn);
    }
    return this.decidePlacement(aiPlayer.hand, randomFn);
  }
  decidePlacement(hand, randomFn) {
    const cardToPlay = this.pickOption(hand, randomFn);
    if (!cardToPlay) {
      throw new Error("AiStrategyService requires at least one card in hand to decide.");
    }
    return {
      cardToPlay,
      captureSubset: []
    };
  }
  getCaptureOptions(hand, table) {
    const captureSubsets = this.getNonEmptySubsets(table);
    const options = [];
    for (const handCard of hand) {
      for (const subset of captureSubsets) {
        const subsetTotal = subset.reduce((sum, tableCard) => sum + tableCard.value, 0);
        if (subsetTotal + handCard.value === 15) {
          options.push({
            cardToPlay: handCard,
            captureSubset: subset
          });
        }
      }
    }
    return options;
  }
  getNonEmptySubsets(cards) {
    const subsets = [];
    const maxMask = 1 << cards.length;
    for (let mask = 1; mask < maxMask; mask++) {
      const subset = [];
      for (let index = 0; index < cards.length; index++) {
        if ((mask & 1 << index) !== 0) {
          subset.push(cards[index]);
        }
      }
      subsets.push(subset);
    }
    return subsets;
  }
  getEscobaOptions(options, table) {
    return options.filter((option) => option.captureSubset.length === table.length);
  }
  getHighValueCaptureScore(captureSubset) {
    return captureSubset.reduce((score, capturedCard) => {
      const isHighValue = capturedCard.suit === "Oros" || capturedCard.rank === "7";
      return score + (isHighValue ? 1 : 0);
    }, 0);
  }
  getProjectedRoundScore(aiPlayer, opponents, captureSubset) {
    const projectedAi = {
      id: aiPlayer.id,
      name: aiPlayer.name,
      hand: [],
      capturedPile: [...aiPlayer.capturedPile, ...captureSubset],
      escobaCount: aiPlayer.escobaCount
    };
    const projectedOpponents = opponents.map((opponent) => ({
      id: opponent.id,
      name: opponent.name,
      hand: [],
      capturedPile: [...opponent.capturedPile],
      escobaCount: opponent.escobaCount
    }));
    const projectedPlayers = [projectedAi, ...projectedOpponents];
    const playerId = projectedAi.id;
    const escobas = scoreEscobas(projectedPlayers).get(playerId) ?? 0;
    const mostCards = scoreMostCards(projectedPlayers).get(playerId) ?? 0;
    const mostOros = scoreMostOros(projectedPlayers).get(playerId) ?? 0;
    const mostSevens = scoreMostSevens(projectedPlayers).get(playerId) ?? 0;
    const sieteDeVelo = scoreSieteDeVelo(projectedPlayers).get(playerId) ?? 0;
    return escobas + mostCards + mostOros + mostSevens + sieteDeVelo;
  }
  getProbabilityWeightedScore(captureSubset, unseenCards) {
    const unseenHighValue = unseenCards.filter((card) => card.suit === "Oros" || card.rank === "7").length;
    const capturedHighValue = this.getHighValueCaptureScore(captureSubset);
    const remainingCards = Math.max(unseenCards.length - captureSubset.length, 0);
    return capturedHighValue * 100 + captureSubset.length * 10 + (unseenHighValue - remainingCards / 2);
  }
  buildCardKey(card) {
    return `${card.suit}-${card.rank}`;
  }
  buildUnseenCards(aiHand, table, capturedCards) {
    const knownCards = [...aiHand, ...table, ...capturedCards];
    const knownCounts = /* @__PURE__ */ new Map();
    for (const knownCard of knownCards) {
      const key = this.buildCardKey(knownCard);
      knownCounts.set(key, (knownCounts.get(key) ?? 0) + 1);
    }
    const unseen = [];
    for (const deckCard of createDeck()) {
      const key = this.buildCardKey(deckCard);
      const remainingKnown = knownCounts.get(key) ?? 0;
      if (remainingKnown > 0) {
        knownCounts.set(key, remainingKnown - 1);
      } else {
        unseen.push(deckCard);
      }
    }
    return unseen;
  }
  pickOption(items, randomFn) {
    const rawIndex = randomFn(items.length);
    const safeIndex = Math.min(Math.max(rawIndex, 0), items.length - 1);
    return items[safeIndex];
  }
  secureRandomIndex = (maxExclusive) => {
    if (maxExclusive <= 1) {
      return 0;
    }
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.getRandomValues) {
      const values = new Uint32Array(1);
      cryptoApi.getRandomValues(values);
      return values[0] % maxExclusive;
    }
    return Math.floor(Math.random() * maxExclusive);
  };
  static \u0275fac = function AiStrategyService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AiStrategyService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AiStrategyService, factory: _AiStrategyService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AiStrategyService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/models/ai-turn.ts
var AI_TURN_IDLE = {
  phase: "idle",
  selectedCardIndex: null,
  revealedCard: null,
  highlightedTableCards: []
};

// src/app/features/game-board/services/card-animation-orchestrator.ts
var EMPTY_ANIMATION_STATE = {
  groups: [],
  activeGroupId: null,
  completedGroupIds: []
};
var CardAnimationOrchestrator = class _CardAnimationOrchestrator {
  animationStateStore = signal(EMPTY_ANIMATION_STATE, ...ngDevMode ? [{ debugName: "animationStateStore" }] : (
    /* istanbul ignore next */
    []
  ));
  lastCompletedGroupIdStore = signal(null, ...ngDevMode ? [{ debugName: "lastCompletedGroupIdStore" }] : (
    /* istanbul ignore next */
    []
  ));
  groupSequence = 0;
  animationState = this.animationStateStore.asReadonly();
  lastCompletedGroupId = this.lastCompletedGroupIdStore.asReadonly();
  startGroup(request) {
    const groupId = this.createGroupId();
    const nextGroup = {
      id: groupId,
      actionType: request.actionType,
      status: "running",
      participantCards: request.cardIds.map((cardId) => ({
        cardId,
        progress: 0,
        completed: false
      }))
    };
    this.animationStateStore.update((state) => __spreadProps(__spreadValues({}, state), {
      groups: [...state.groups, nextGroup],
      activeGroupId: groupId
    }));
    return groupId;
  }
  completeParticipant(groupId, cardId, progress) {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    this.animationStateStore.update((state) => __spreadProps(__spreadValues({}, state), {
      groups: state.groups.map((group) => {
        if (group.id !== groupId || group.status !== "running") {
          return group;
        }
        return __spreadProps(__spreadValues({}, group), {
          participantCards: group.participantCards.map((participant) => {
            if (participant.cardId !== cardId) {
              return participant;
            }
            return __spreadProps(__spreadValues({}, participant), {
              progress: clampedProgress,
              completed: clampedProgress >= 100
            });
          })
        });
      })
    }));
  }
  finalizeGroup(groupId) {
    let finalized = false;
    this.animationStateStore.update((state) => {
      const targetGroup = state.groups.find((group) => group.id === groupId);
      if (!targetGroup || targetGroup.status === "canceled") {
        return state;
      }
      finalized = true;
      const nextCompletedGroupIds = state.completedGroupIds.includes(groupId) ? state.completedGroupIds : [...state.completedGroupIds, groupId];
      return __spreadProps(__spreadValues({}, state), {
        groups: state.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }
          return __spreadProps(__spreadValues({}, group), {
            status: "completed"
          });
        }),
        activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
        completedGroupIds: nextCompletedGroupIds
      });
    });
    if (finalized) {
      this.lastCompletedGroupIdStore.set(groupId);
    }
  }
  cancelGroup(groupId) {
    this.animationStateStore.update((state) => {
      const targetGroup = state.groups.find((group) => group.id === groupId);
      if (!targetGroup || targetGroup.status !== "running") {
        return state;
      }
      return __spreadProps(__spreadValues({}, state), {
        groups: state.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }
          return __spreadProps(__spreadValues({}, group), {
            status: "canceled"
          });
        }),
        activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId
      });
    });
  }
  createGroupId() {
    this.groupSequence += 1;
    return `animation-group-${this.groupSequence}`;
  }
  static \u0275fac = function CardAnimationOrchestrator_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardAnimationOrchestrator)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CardAnimationOrchestrator, factory: _CardAnimationOrchestrator.\u0275fac });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CardAnimationOrchestrator, [{
    type: Injectable
  }], null, null);
})();

// src/app/features/game-board/services/turn-pause-policy.ts
var DEFAULT_STAGE_PAUSE_MS = {
  "ai-deliberation": 600,
  "ai-selection-preview": 600,
  "ai-capture-preview": 700,
  "ai-post-play-confirm": 300,
  "player-post-play-confirm": 600
};
var TurnPausePolicy = class _TurnPausePolicy {
  runtimeOverrideMs = null;
  hasRuntimeOverride() {
    return this.runtimeOverrideMs !== null;
  }
  resolvePauseMs(stage, options) {
    const configuredPause = this.runtimeOverrideMs ?? DEFAULT_STAGE_PAUSE_MS[stage];
    if (options.reducedMotion) {
      return configuredPause;
    }
    return configuredPause;
  }
  setRuntimeOverrideMs(overrideMs) {
    this.runtimeOverrideMs = overrideMs === null ? null : this.normalizePauseMs(overrideMs);
  }
  normalizePauseMs(value) {
    return Math.max(0, Math.round(value));
  }
  static \u0275fac = function TurnPausePolicy_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TurnPausePolicy)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _TurnPausePolicy, factory: _TurnPausePolicy.\u0275fac });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TurnPausePolicy, [{
    type: Injectable
  }], null, null);
})();

// src/app/features/game-board/services/table-interaction-state.ts
function cardEquals(left, right) {
  return left.suit === right.suit && left.rank === right.rank;
}
var TableInteractionState = class _TableInteractionState {
  _selectedHandCard = signal(null, ...ngDevMode ? [{ debugName: "_selectedHandCard" }] : (
    /* istanbul ignore next */
    []
  ));
  _selectedTableCards = signal([], ...ngDevMode ? [{ debugName: "_selectedTableCards" }] : (
    /* istanbul ignore next */
    []
  ));
  _handoffEnabled = signal(false, ...ngDevMode ? [{ debugName: "_handoffEnabled" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedHandCard = this._selectedHandCard.asReadonly();
  selectedTableCards = this._selectedTableCards.asReadonly();
  handoffEnabled = this._handoffEnabled.asReadonly();
  isCaptureSelectionValid = computed(() => {
    const handCard = this._selectedHandCard();
    if (handCard === null) {
      return true;
    }
    const tableCards = this._selectedTableCards();
    if (tableCards.length === 0) {
      return true;
    }
    const subsetValue = tableCards.reduce((sum, card) => sum + card.value, 0);
    return handCard.value + subsetValue === 15;
  }, ...ngDevMode ? [{ debugName: "isCaptureSelectionValid" }] : (
    /* istanbul ignore next */
    []
  ));
  canSubmitPlay = computed(() => {
    return this._selectedHandCard() !== null && this.isCaptureSelectionValid();
  }, ...ngDevMode ? [{ debugName: "canSubmitPlay" }] : (
    /* istanbul ignore next */
    []
  ));
  selectHandCard(card) {
    this._selectedHandCard.set(card);
  }
  clearSelectedHandCard() {
    this._selectedHandCard.set(null);
  }
  toggleTableCard(card) {
    this._selectedTableCards.update((selectedCards) => {
      const index = selectedCards.findIndex((selectedCard) => cardEquals(selectedCard, card));
      if (index >= 0) {
        return selectedCards.filter((_, selectedIndex) => selectedIndex !== index);
      }
      return [...selectedCards, card];
    });
  }
  clearSelectedTableCards() {
    this._selectedTableCards.set([]);
  }
  setHandoffEnabled(enabled) {
    this._handoffEnabled.set(enabled);
  }
  resetForNextAction() {
    this._selectedHandCard.set(null);
    this._selectedTableCards.set([]);
  }
  static \u0275fac = function TableInteractionState_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TableInteractionState)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _TableInteractionState, factory: _TableInteractionState.\u0275fac });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TableInteractionState, [{
    type: Injectable
  }], null, null);
})();

// src/app/features/game-board/game-table-page/components/a11y-live-region/a11y-live-region.ts
var A11yLiveRegion = class _A11yLiveRegion {
  messageState = signal("", ...ngDevMode ? [{ debugName: "messageState" }] : (
    /* istanbul ignore next */
    []
  ));
  messageSignal = this.messageState.asReadonly();
  set message(value) {
    this.messageState.set(value ?? "");
  }
  get message() {
    return this.messageState();
  }
  static \u0275fac = function A11yLiveRegion_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _A11yLiveRegion)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _A11yLiveRegion, selectors: [["app-a11y-live-region"]], inputs: { message: "message" }, decls: 2, vars: 1, consts: [["data-testid", "a11y-live-region", "aria-live", "polite", "aria-atomic", "true", 1, "a11y-live-region"]], template: function A11yLiveRegion_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p", 0);
      \u0275\u0275text(1);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.messageSignal(), "\n");
    }
  }, styles: ["\n.a11y-live-region[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  clip-path: inset(50%);\n  white-space: nowrap;\n  border: 0;\n}\n/*# sourceMappingURL=a11y-live-region.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(A11yLiveRegion, [{
    type: Component,
    args: [{ selector: "app-a11y-live-region", imports: [], template: '<p class="a11y-live-region" data-testid="a11y-live-region" aria-live="polite" aria-atomic="true">\n  {{ messageSignal() }}\n</p>\n', styles: ["/* src/app/features/game-board/game-table-page/components/a11y-live-region/a11y-live-region.scss */\n.a11y-live-region {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  clip-path: inset(50%);\n  white-space: nowrap;\n  border: 0;\n}\n/*# sourceMappingURL=a11y-live-region.css.map */\n"] }]
  }], null, { message: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(A11yLiveRegion, { className: "A11yLiveRegion", filePath: "src/app/features/game-board/game-table-page/components/a11y-live-region/a11y-live-region.ts", lineNumber: 9 });
})();

// src/app/features/game-board/game-table-page/components/play-action-bar/play-action-bar.ts
function PlayActionBar_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "label", 1)(1, "input", 6);
    \u0275\u0275domListener("change", function PlayActionBar_Conditional_1_Template_input_change_1_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onHandoffToggleChanged($event));
    });
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(2, "span");
    \u0275\u0275text(3, "Enable turn handoff");
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275domProperty("checked", ctx_r1.handoffEnabledSignal());
  }
}
var PlayActionBar = class _PlayActionBar {
  canSubmitPlayState = signal(false, ...ngDevMode ? [{ debugName: "canSubmitPlayState" }] : (
    /* istanbul ignore next */
    []
  ));
  isCaptureSelectionValidState = signal(true, ...ngDevMode ? [{ debugName: "isCaptureSelectionValidState" }] : (
    /* istanbul ignore next */
    []
  ));
  turnPhaseState = signal("awaiting-card-play", ...ngDevMode ? [{ debugName: "turnPhaseState" }] : (
    /* istanbul ignore next */
    []
  ));
  validationMessageState = signal("", ...ngDevMode ? [{ debugName: "validationMessageState" }] : (
    /* istanbul ignore next */
    []
  ));
  multiplayerState = signal(false, ...ngDevMode ? [{ debugName: "multiplayerState" }] : (
    /* istanbul ignore next */
    []
  ));
  handoffEnabledState = signal(false, ...ngDevMode ? [{ debugName: "handoffEnabledState" }] : (
    /* istanbul ignore next */
    []
  ));
  overlayBlockedState = signal(false, ...ngDevMode ? [{ debugName: "overlayBlockedState" }] : (
    /* istanbul ignore next */
    []
  ));
  interactionEnabledState = signal(true, ...ngDevMode ? [{ debugName: "interactionEnabledState" }] : (
    /* istanbul ignore next */
    []
  ));
  submitLockedState = signal(false, ...ngDevMode ? [{ debugName: "submitLockedState" }] : (
    /* istanbul ignore next */
    []
  ));
  canSubmitPlaySignal = this.canSubmitPlayState.asReadonly();
  isCaptureSelectionValidSignal = this.isCaptureSelectionValidState.asReadonly();
  turnPhaseSignal = this.turnPhaseState.asReadonly();
  validationMessageSignal = this.validationMessageState.asReadonly();
  multiplayerSignal = this.multiplayerState.asReadonly();
  handoffEnabledSignal = this.handoffEnabledState.asReadonly();
  overlayBlockedSignal = this.overlayBlockedState.asReadonly();
  interactionEnabledSignal = this.interactionEnabledState.asReadonly();
  submitLockedSignal = this.submitLockedState.asReadonly();
  submitPlayClicked = output();
  confirmTurnClicked = output();
  handoffToggleChanged = output();
  set canSubmitPlay(value) {
    this.canSubmitPlayState.set(value ?? false);
  }
  get canSubmitPlay() {
    return this.canSubmitPlayState();
  }
  set isCaptureSelectionValid(value) {
    this.isCaptureSelectionValidState.set(value ?? true);
  }
  get isCaptureSelectionValid() {
    return this.isCaptureSelectionValidState();
  }
  set turnPhase(value) {
    this.turnPhaseState.set(value ?? "awaiting-card-play");
  }
  get turnPhase() {
    return this.turnPhaseState();
  }
  set validationMessage(value) {
    this.validationMessageState.set(value ?? "");
  }
  get validationMessage() {
    return this.validationMessageState();
  }
  set multiplayer(value) {
    this.multiplayerState.set(value ?? false);
  }
  get multiplayer() {
    return this.multiplayerState();
  }
  set handoffEnabled(value) {
    this.handoffEnabledState.set(value ?? false);
  }
  get handoffEnabled() {
    return this.handoffEnabledState();
  }
  set overlayBlocked(value) {
    this.overlayBlockedState.set(value ?? false);
  }
  get overlayBlocked() {
    return this.overlayBlockedState();
  }
  set interactionEnabled(value) {
    this.interactionEnabledState.set(value ?? true);
  }
  get interactionEnabled() {
    return this.interactionEnabledState();
  }
  set submitLocked(value) {
    this.submitLockedState.set(value ?? false);
  }
  get submitLocked() {
    return this.submitLockedState();
  }
  onSubmitPlay() {
    if (this.submitLockedSignal() || !this.interactionEnabledSignal() || this.submitPlayDisabled() || this.turnPhaseSignal() !== "awaiting-card-play") {
      return;
    }
    this.submitPlayClicked.emit();
  }
  onConfirmTurn() {
    if (this.confirmTurnDisabled()) {
      return;
    }
    this.confirmTurnClicked.emit();
  }
  onHandoffToggleChanged(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.handoffToggleChanged.emit(target.checked);
  }
  submitPlayDisabled() {
    return this.submitLockedSignal() || !this.canSubmitPlaySignal() || !this.isCaptureSelectionValidSignal();
  }
  confirmTurnDisabled() {
    return this.turnPhaseSignal() !== "awaiting-confirmation";
  }
  static \u0275fac = function PlayActionBar_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PlayActionBar)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PlayActionBar, selectors: [["app-play-action-bar"]], inputs: { canSubmitPlay: "canSubmitPlay", isCaptureSelectionValid: "isCaptureSelectionValid", turnPhase: "turnPhase", validationMessage: "validationMessage", multiplayer: "multiplayer", handoffEnabled: "handoffEnabled", overlayBlocked: "overlayBlocked", interactionEnabled: "interactionEnabled", submitLocked: "submitLocked" }, outputs: { submitPlayClicked: "submitPlayClicked", confirmTurnClicked: "confirmTurnClicked", handoffToggleChanged: "handoffToggleChanged" }, decls: 9, vars: 6, consts: [["data-testid", "play-action-bar", "aria-label", "Play actions", 1, "play-action-bar"], ["for", "handoff-toggle-input", 1, "play-action-bar__handoff-toggle"], [1, "play-action-bar__actions"], ["type", "button", "data-testid", "submit-play", "aria-label", "Submit play", 3, "click", "disabled"], ["type", "button", "data-testid", "confirm-turn", "aria-label", "Confirm turn", 3, "click", "disabled"], ["data-testid", "play-validation-message", "tabindex", "-1"], ["id", "handoff-toggle-input", "type", "checkbox", "data-testid", "handoff-toggle", "aria-label", "Enable turn handoff", 3, "change", "checked"]], template: function PlayActionBar_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "section", 0);
      \u0275\u0275conditionalCreate(1, PlayActionBar_Conditional_1_Template, 4, 1, "label", 1);
      \u0275\u0275domElementStart(2, "div", 2)(3, "button", 3);
      \u0275\u0275domListener("click", function PlayActionBar_Template_button_click_3_listener() {
        return ctx.onSubmitPlay();
      });
      \u0275\u0275text(4, " Submit play ");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(5, "button", 4);
      \u0275\u0275domListener("click", function PlayActionBar_Template_button_click_5_listener() {
        return ctx.onConfirmTurn();
      });
      \u0275\u0275text(6, " Confirm turn ");
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(7, "p", 5);
      \u0275\u0275text(8);
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("aria-hidden", ctx.overlayBlockedSignal() ? "true" : null)("inert", ctx.overlayBlockedSignal() ? "" : null);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.multiplayerSignal() ? 1 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275domProperty("disabled", ctx.submitPlayDisabled());
      \u0275\u0275advance(2);
      \u0275\u0275domProperty("disabled", ctx.confirmTurnDisabled());
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.validationMessageSignal());
    }
  }, styles: ["\n.play-action-bar[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  gap: 0.5rem;\n}\n.play-action-bar__handoff-toggle[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.9rem;\n  line-height: 1.3;\n}\n.play-action-bar__handoff-toggle[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  inline-size: 2.75rem;\n  block-size: 2.75rem;\n}\n.play-action-bar__actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.play-action-bar__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  font-weight: 600;\n  line-height: 1.2;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n.play-action-bar__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled {\n  opacity: 0.6;\n}\n[data-testid=play-validation-message][_ngcontent-%COMP%] {\n  margin: 0;\n  min-height: 1.5rem;\n}\n@media (max-width: 480px) {\n  .play-action-bar__actions[_ngcontent-%COMP%] {\n    justify-content: stretch;\n  }\n  .play-action-bar__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    flex: 1 1 9rem;\n  }\n}\n/*# sourceMappingURL=play-action-bar.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlayActionBar, [{
    type: Component,
    args: [{ selector: "app-play-action-bar", imports: [], template: `<section
  class="play-action-bar"
  data-testid="play-action-bar"
  aria-label="Play actions"
  [attr.aria-hidden]="overlayBlockedSignal() ? 'true' : null"
  [attr.inert]="overlayBlockedSignal() ? '' : null"
>
  @if (multiplayerSignal()) {
    <label class="play-action-bar__handoff-toggle" for="handoff-toggle-input">
      <input
        id="handoff-toggle-input"
        type="checkbox"
        data-testid="handoff-toggle"
        aria-label="Enable turn handoff"
        [checked]="handoffEnabledSignal()"
        (change)="onHandoffToggleChanged($event)"
      />
      <span>Enable turn handoff</span>
    </label>
  }

  <div class="play-action-bar__actions">
    <button
      type="button"
      data-testid="submit-play"
      aria-label="Submit play"
      [disabled]="submitPlayDisabled()"
      (click)="onSubmitPlay()"
    >
      Submit play
    </button>

    <button
      type="button"
      data-testid="confirm-turn"
      aria-label="Confirm turn"
      [disabled]="confirmTurnDisabled()"
      (click)="onConfirmTurn()"
    >
      Confirm turn
    </button>
  </div>

  <p data-testid="play-validation-message" tabindex="-1">{{ validationMessageSignal() }}</p>
</section>
`, styles: ["/* src/app/features/game-board/game-table-page/components/play-action-bar/play-action-bar.scss */\n.play-action-bar {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  gap: 0.5rem;\n}\n.play-action-bar__handoff-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.9rem;\n  line-height: 1.3;\n}\n.play-action-bar__handoff-toggle input {\n  inline-size: 2.75rem;\n  block-size: 2.75rem;\n}\n.play-action-bar__actions {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.play-action-bar__actions button {\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  font-weight: 600;\n  line-height: 1.2;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n.play-action-bar__actions button:disabled {\n  opacity: 0.6;\n}\n[data-testid=play-validation-message] {\n  margin: 0;\n  min-height: 1.5rem;\n}\n@media (max-width: 480px) {\n  .play-action-bar__actions {\n    justify-content: stretch;\n  }\n  .play-action-bar__actions button {\n    flex: 1 1 9rem;\n  }\n}\n/*# sourceMappingURL=play-action-bar.css.map */\n"] }]
  }], null, { submitPlayClicked: [{ type: Output, args: ["submitPlayClicked"] }], confirmTurnClicked: [{ type: Output, args: ["confirmTurnClicked"] }], handoffToggleChanged: [{ type: Output, args: ["handoffToggleChanged"] }], canSubmitPlay: [{
    type: Input
  }], isCaptureSelectionValid: [{
    type: Input
  }], turnPhase: [{
    type: Input
  }], validationMessage: [{
    type: Input
  }], multiplayer: [{
    type: Input
  }], handoffEnabled: [{
    type: Input
  }], overlayBlocked: [{
    type: Input
  }], interactionEnabled: [{
    type: Input
  }], submitLocked: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PlayActionBar, { className: "PlayActionBar", filePath: "src/app/features/game-board/game-table-page/components/play-action-bar/play-action-bar.ts", lineNumber: 10 });
})();

// src/app/features/game-board/game-table-page/components/turn-handoff-overlay/turn-handoff-overlay.ts
var TurnHandoffOverlay = class _TurnHandoffOverlay {
  nextPlayerNameState = signal("", ...ngDevMode ? [{ debugName: "nextPlayerNameState" }] : (
    /* istanbul ignore next */
    []
  ));
  nextPlayerNameSignal = this.nextPlayerNameState.asReadonly();
  handoffAcknowledged = output();
  set nextPlayerName(value) {
    this.nextPlayerNameState.set(value ?? "");
  }
  get nextPlayerName() {
    return this.nextPlayerNameState();
  }
  acknowledgeHandoff() {
    this.handoffAcknowledged.emit();
  }
  static \u0275fac = function TurnHandoffOverlay_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TurnHandoffOverlay)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _TurnHandoffOverlay, selectors: [["app-turn-handoff-overlay"]], inputs: { nextPlayerName: "nextPlayerName" }, outputs: { handoffAcknowledged: "handoffAcknowledged" }, decls: 9, vars: 1, consts: [["data-testid", "turn-handoff-overlay", "role", "dialog", "aria-modal", "true", "aria-label", "Turn handoff required", 1, "turn-handoff-overlay"], [1, "turn-handoff-overlay__title"], [1, "turn-handoff-overlay__instructions"], ["data-testid", "next-turn-reveal", "aria-hidden", "true", 1, "turn-handoff-overlay__next-turn"], ["type", "button", "data-testid", "handoff-acknowledge", "aria-label", "Acknowledge handoff and reveal next turn", 3, "click"]], template: function TurnHandoffOverlay_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "section", 0)(1, "p", 1);
      \u0275\u0275text(2, "Pass the device to the next player");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(3, "p", 2);
      \u0275\u0275text(4, "Confirm once the next player is ready.");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(5, "p", 3);
      \u0275\u0275text(6);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(7, "button", 4);
      \u0275\u0275domListener("click", function TurnHandoffOverlay_Template_button_click_7_listener() {
        return ctx.acknowledgeHandoff();
      });
      \u0275\u0275text(8, " Reveal next turn ");
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1(" Next turn: ", ctx.nextPlayerNameSignal(), " ");
    }
  }, styles: ["\n.turn-handoff-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 5;\n  display: grid;\n  align-content: center;\n  justify-items: center;\n  gap: 0.75rem;\n  padding: 1.5rem;\n  border-radius: 0.75rem;\n  background: rgba(2, 8, 6, 0.96);\n  color: #f7f3e8;\n}\n.turn-handoff-overlay__title[_ngcontent-%COMP%], \n.turn-handoff-overlay__instructions[_ngcontent-%COMP%], \n.turn-handoff-overlay__next-turn[_ngcontent-%COMP%] {\n  margin: 0;\n  max-inline-size: 36rem;\n  text-align: center;\n}\n.turn-handoff-overlay__next-turn[_ngcontent-%COMP%] {\n  display: none;\n}\n.turn-handoff-overlay[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  justify-self: start;\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  font-weight: 600;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n@media (max-width: 480px) {\n  .turn-handoff-overlay[_ngcontent-%COMP%] {\n    align-content: center;\n    gap: 0.625rem;\n    padding: 1rem;\n  }\n  .turn-handoff-overlay[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    justify-self: stretch;\n  }\n}\n/*# sourceMappingURL=turn-handoff-overlay.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TurnHandoffOverlay, [{
    type: Component,
    args: [{ selector: "app-turn-handoff-overlay", imports: [], template: '<section\n  class="turn-handoff-overlay"\n  data-testid="turn-handoff-overlay"\n  role="dialog"\n  aria-modal="true"\n  aria-label="Turn handoff required"\n>\n  <p class="turn-handoff-overlay__title">Pass the device to the next player</p>\n  <p class="turn-handoff-overlay__instructions">Confirm once the next player is ready.</p>\n  <p class="turn-handoff-overlay__next-turn" data-testid="next-turn-reveal" aria-hidden="true">\n    Next turn: {{ nextPlayerNameSignal() }}\n  </p>\n  <button\n    type="button"\n    data-testid="handoff-acknowledge"\n    aria-label="Acknowledge handoff and reveal next turn"\n    (click)="acknowledgeHandoff()"\n  >\n    Reveal next turn\n  </button>\n</section>\n', styles: ["/* src/app/features/game-board/game-table-page/components/turn-handoff-overlay/turn-handoff-overlay.scss */\n.turn-handoff-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 5;\n  display: grid;\n  align-content: center;\n  justify-items: center;\n  gap: 0.75rem;\n  padding: 1.5rem;\n  border-radius: 0.75rem;\n  background: rgba(2, 8, 6, 0.96);\n  color: #f7f3e8;\n}\n.turn-handoff-overlay__title,\n.turn-handoff-overlay__instructions,\n.turn-handoff-overlay__next-turn {\n  margin: 0;\n  max-inline-size: 36rem;\n  text-align: center;\n}\n.turn-handoff-overlay__next-turn {\n  display: none;\n}\n.turn-handoff-overlay button {\n  justify-self: start;\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  font-weight: 600;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n@media (max-width: 480px) {\n  .turn-handoff-overlay {\n    align-content: center;\n    gap: 0.625rem;\n    padding: 1rem;\n  }\n  .turn-handoff-overlay button {\n    justify-self: stretch;\n  }\n}\n/*# sourceMappingURL=turn-handoff-overlay.css.map */\n"] }]
  }], null, { handoffAcknowledged: [{ type: Output, args: ["handoffAcknowledged"] }], nextPlayerName: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(TurnHandoffOverlay, { className: "TurnHandoffOverlay", filePath: "src/app/features/game-board/game-table-page/components/turn-handoff-overlay/turn-handoff-overlay.ts", lineNumber: 9 });
})();

// src/app/features/game-board/utils/card-asset-mapper.ts
function rankToAssetIndex(rank) {
  if (rank === "Sota") {
    return "10";
  }
  if (rank === "Caballo") {
    return "11";
  }
  if (rank === "Rey") {
    return "12";
  }
  return rank;
}
function mapCardToVisual(card) {
  const rankIndex = rankToAssetIndex(card.rank);
  return {
    assetPath: `/cards/${card.suit}_${rankIndex}.png`,
    semanticLabel: `${card.rank} de ${card.suit}`
  };
}

// src/app/features/game-board/game-table-page/components/card-visual/card-visual.ts
var CardVisual = class _CardVisual {
  cardState = signal(null, ...ngDevMode ? [{ debugName: "cardState" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedState = signal(false, ...ngDevMode ? [{ debugName: "selectedState" }] : (
    /* istanbul ignore next */
    []
  ));
  faceDownState = signal(false, ...ngDevMode ? [{ debugName: "faceDownState" }] : (
    /* istanbul ignore next */
    []
  ));
  testIdState = signal(null, ...ngDevMode ? [{ debugName: "testIdState" }] : (
    /* istanbul ignore next */
    []
  ));
  mirrorStateToFigureState = signal(true, ...ngDevMode ? [{ debugName: "mirrorStateToFigureState" }] : (
    /* istanbul ignore next */
    []
  ));
  animationStateStore = signal(null, ...ngDevMode ? [{ debugName: "animationStateStore" }] : (
    /* istanbul ignore next */
    []
  ));
  cardSignal = this.cardState.asReadonly();
  selectedSignal = this.selectedState.asReadonly();
  faceDownSignal = this.faceDownState.asReadonly();
  testIdSignal = this.testIdState.asReadonly();
  mirrorStateToFigureSignal = this.mirrorStateToFigureState.asReadonly();
  animationStateSignal = this.animationStateStore.asReadonly();
  resolvedTestId = computed(() => this.testIdSignal() ?? "card-visual", ...ngDevMode ? [{ debugName: "resolvedTestId" }] : (
    /* istanbul ignore next */
    []
  ));
  mappedAsset = computed(() => {
    if (this.faceDownSignal()) {
      return {
        assetPath: "/cards/Card_Back.png",
        semanticLabel: "Carta oculta"
      };
    }
    const card = this.cardSignal();
    if (!card) {
      return {
        assetPath: "/cards/Card_Back.png",
        semanticLabel: "Carta no disponible"
      };
    }
    return mapCardToVisual(card);
  }, ...ngDevMode ? [{ debugName: "mappedAsset" }] : (
    /* istanbul ignore next */
    []
  ));
  imagePath = computed(() => this.mappedAsset().assetPath, ...ngDevMode ? [{ debugName: "imagePath" }] : (
    /* istanbul ignore next */
    []
  ));
  semanticLabel = computed(() => this.mappedAsset().semanticLabel, ...ngDevMode ? [{ debugName: "semanticLabel" }] : (
    /* istanbul ignore next */
    []
  ));
  isPlayAnimation = computed(() => this.animationStateSignal() === "play", ...ngDevMode ? [{ debugName: "isPlayAnimation" }] : (
    /* istanbul ignore next */
    []
  ));
  isCaptureAnimation = computed(() => this.animationStateSignal() === "capture", ...ngDevMode ? [{ debugName: "isCaptureAnimation" }] : (
    /* istanbul ignore next */
    []
  ));
  isDealAnimation = computed(() => this.animationStateSignal() === "deal", ...ngDevMode ? [{ debugName: "isDealAnimation" }] : (
    /* istanbul ignore next */
    []
  ));
  isOpponentAnimation = computed(() => this.animationStateSignal() === "opponent", ...ngDevMode ? [{ debugName: "isOpponentAnimation" }] : (
    /* istanbul ignore next */
    []
  ));
  isEscobaAnimation = computed(() => this.animationStateSignal() === "escoba", ...ngDevMode ? [{ debugName: "isEscobaAnimation" }] : (
    /* istanbul ignore next */
    []
  ));
  set card(value) {
    this.cardState.set(value);
  }
  get card() {
    return this.cardState();
  }
  set selected(value) {
    this.selectedState.set(value);
  }
  get selected() {
    return this.selectedState();
  }
  set faceDown(value) {
    this.faceDownState.set(value);
  }
  get faceDown() {
    return this.faceDownState();
  }
  set testId(value) {
    this.testIdState.set(value ?? null);
  }
  get testId() {
    return this.testIdState();
  }
  set mirrorStateToFigure(value) {
    this.mirrorStateToFigureState.set(value);
  }
  get mirrorStateToFigure() {
    return this.mirrorStateToFigureState();
  }
  set animationState(value) {
    this.animationStateStore.set(value);
  }
  get animationState() {
    return this.animationStateStore();
  }
  static \u0275fac = function CardVisual_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardVisual)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardVisual, selectors: [["app-card-visual"]], hostVars: 16, hostBindings: function CardVisual_HostBindings(rf, ctx) {
    if (rf & 2) {
      \u0275\u0275attribute("data-testid", ctx.resolvedTestId())("aria-label", ctx.semanticLabel());
      \u0275\u0275classProp("card-visual--focus-visible", true)("card-visual--selected", ctx.selectedSignal())("card-visual--animation-play", ctx.isPlayAnimation())("card-visual--animation-capture", ctx.isCaptureAnimation())("card-visual--animation-deal", ctx.isDealAnimation())("card-visual--animation-opponent", ctx.isOpponentAnimation())("card-visual--animation-escoba", ctx.isEscobaAnimation());
    }
  }, inputs: { card: "card", selected: "selected", faceDown: "faceDown", testId: "testId", mirrorStateToFigure: "mirrorStateToFigure", animationState: "animationState" }, decls: 2, vars: 18, consts: [[1, "card-visual"], ["data-testid", "card-visual-image", 1, "card-visual-image", 3, "src", "alt"]], template: function CardVisual_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "figure", 0);
      \u0275\u0275domElement(1, "img", 1);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classProp("card-visual--focus-visible", ctx.mirrorStateToFigureSignal())("card-visual--selected", ctx.mirrorStateToFigureSignal() && ctx.selectedSignal())("card-visual--animation-play", ctx.mirrorStateToFigureSignal() && ctx.isPlayAnimation())("card-visual--animation-capture", ctx.mirrorStateToFigureSignal() && ctx.isCaptureAnimation())("card-visual--animation-deal", ctx.mirrorStateToFigureSignal() && ctx.isDealAnimation())("card-visual--animation-opponent", ctx.mirrorStateToFigureSignal() && ctx.isOpponentAnimation())("card-visual--animation-escoba", ctx.mirrorStateToFigureSignal() && ctx.isEscobaAnimation());
      \u0275\u0275attribute("data-testid", ctx.mirrorStateToFigureSignal() ? "card-visual" : null)("aria-label", ctx.mirrorStateToFigureSignal() ? ctx.semanticLabel() : null);
      \u0275\u0275advance();
      \u0275\u0275domProperty("src", ctx.imagePath(), \u0275\u0275sanitizeUrl)("alt", ctx.semanticLabel());
    }
  }, styles: ["\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n.card-visual[_ngcontent-%COMP%] {\n  margin: 0;\n  display: block;\n  width: 100%;\n  height: 100%;\n  border-radius: 0.5rem;\n  overflow: hidden;\n  contain: strict;\n  will-change: transform, opacity;\n  transition: transform 120ms ease, box-shadow 120ms ease;\n}\n.card-visual-image[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.card-visual--selected[_ngcontent-%COMP%], \n.card-visual--selected[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n  box-shadow: 0 0 0 3px rgba(244, 211, 94, 0.85);\n  transform: translateY(-2px);\n}\n.card-visual--animation-play[_ngcontent-%COMP%], \n.card-visual--animation-play[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n  transform: translateY(-4px);\n  animation-name: _ngcontent-%COMP%_card-play-arc;\n  animation-duration: 1000ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-capture[_ngcontent-%COMP%], \n.card-visual--animation-capture[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n  opacity: 0;\n  transform: scale(0.5);\n  box-shadow: 0 0 0 3px rgba(245, 197, 66, 0.75), 0 0 16px rgba(217, 160, 42, 0.55);\n  animation-name: _ngcontent-%COMP%_card-capture-fade;\n  animation-duration: 900ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-deal[_ngcontent-%COMP%], \n.card-visual--animation-deal[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n  transform: translateY(-3px) scale(1.01);\n  animation-name: _ngcontent-%COMP%_card-deal-slide;\n  animation-duration: 1000ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-opponent[_ngcontent-%COMP%], \n.card-visual--animation-opponent[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n  transform: translateY(-2px) scale(0.99);\n  animation-name: _ngcontent-%COMP%_card-opponent-play;\n  animation-duration: 1000ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-escoba[_ngcontent-%COMP%], \n.card-visual--animation-escoba[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n  opacity: 0;\n  transform: scale(0.2);\n  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.75), 0 0 18px rgba(249, 115, 22, 0.5);\n  animation-name: _ngcontent-%COMP%_card-escoba-burst;\n  animation-duration: 700ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--focus-visible[_ngcontent-%COMP%]:focus-visible, \n.card-visual--focus-visible[_nghost-%COMP%]:focus-visible   .card-visual[_ngcontent-%COMP%] {\n  outline: 3px solid rgba(56, 189, 248, 0.95);\n  outline-offset: 3px;\n}\n@keyframes _ngcontent-%COMP%_card-play-arc {\n  0% {\n    transform: translateY(0);\n  }\n  50% {\n    transform: translateY(-8px);\n  }\n  100% {\n    transform: translateY(-4px);\n  }\n}\n@keyframes _ngcontent-%COMP%_card-capture-fade {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  35% {\n    opacity: 0.85;\n    transform: scale(0.96);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.5);\n  }\n}\n@keyframes _ngcontent-%COMP%_card-deal-slide {\n  0% {\n    opacity: 0.25;\n    transform: translateY(-18px) scale(0.95);\n  }\n  45% {\n    opacity: 0.8;\n    transform: translateY(-10px) scale(0.99);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(-3px) scale(1.01);\n  }\n}\n@keyframes _ngcontent-%COMP%_card-opponent-play {\n  0% {\n    opacity: 0.7;\n    transform: translateY(0) scale(1);\n  }\n  50% {\n    opacity: 0.9;\n    transform: translateY(-7px) scale(0.995);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(-2px) scale(0.99);\n  }\n}\n@keyframes _ngcontent-%COMP%_card-escoba-burst {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.85), 0 0 22px rgba(249, 115, 22, 0.65);\n  }\n  35% {\n    opacity: 0.9;\n    transform: scale(1.08);\n    box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.9), 0 0 26px rgba(251, 146, 60, 0.7);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.2);\n    box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.15), 0 0 10px rgba(251, 191, 36, 0.1);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .card-visual[_ngcontent-%COMP%], \n   .card-visual--animation-play[_ngcontent-%COMP%], \n   .card-visual--animation-play[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%], \n   .card-visual--animation-capture[_ngcontent-%COMP%], \n   .card-visual--animation-capture[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%], \n   .card-visual--animation-deal[_ngcontent-%COMP%], \n   .card-visual--animation-deal[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%], \n   .card-visual--animation-opponent[_ngcontent-%COMP%], \n   .card-visual--animation-opponent[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%], \n   .card-visual--animation-escoba[_ngcontent-%COMP%], \n   .card-visual--animation-escoba[_nghost-%COMP%]   .card-visual[_ngcontent-%COMP%] {\n    transition-duration: 0ms;\n    animation-duration: 0ms;\n    animation-delay: 0ms;\n    animation-iteration-count: 1;\n  }\n}\n/*# sourceMappingURL=card-visual.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CardVisual, [{
    type: Component,
    args: [{ selector: "app-card-visual", imports: [], host: {
      "[attr.data-testid]": "resolvedTestId()",
      "[attr.aria-label]": "semanticLabel()",
      "[class.card-visual--focus-visible]": "true",
      "[class.card-visual--selected]": "selectedSignal()",
      "[class.card-visual--animation-play]": "isPlayAnimation()",
      "[class.card-visual--animation-capture]": "isCaptureAnimation()",
      "[class.card-visual--animation-deal]": "isDealAnimation()",
      "[class.card-visual--animation-opponent]": "isOpponentAnimation()",
      "[class.card-visual--animation-escoba]": "isEscobaAnimation()"
    }, template: `<figure
  class="card-visual"
  [attr.data-testid]="mirrorStateToFigureSignal() ? 'card-visual' : null"
  [attr.aria-label]="mirrorStateToFigureSignal() ? semanticLabel() : null"
  [class.card-visual--focus-visible]="mirrorStateToFigureSignal()"
  [class.card-visual--selected]="mirrorStateToFigureSignal() && selectedSignal()"
  [class.card-visual--animation-play]="mirrorStateToFigureSignal() && isPlayAnimation()"
  [class.card-visual--animation-capture]="mirrorStateToFigureSignal() && isCaptureAnimation()"
  [class.card-visual--animation-deal]="mirrorStateToFigureSignal() && isDealAnimation()"
  [class.card-visual--animation-opponent]="mirrorStateToFigureSignal() && isOpponentAnimation()"
  [class.card-visual--animation-escoba]="mirrorStateToFigureSignal() && isEscobaAnimation()"
>
  <img
    class="card-visual-image"
    data-testid="card-visual-image"
    [src]="imagePath()"
    [alt]="semanticLabel()"
  />
</figure>
`, styles: ["/* src/app/features/game-board/game-table-page/components/card-visual/card-visual.scss */\n:host {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n.card-visual {\n  margin: 0;\n  display: block;\n  width: 100%;\n  height: 100%;\n  border-radius: 0.5rem;\n  overflow: hidden;\n  contain: strict;\n  will-change: transform, opacity;\n  transition: transform 120ms ease, box-shadow 120ms ease;\n}\n.card-visual-image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.card-visual--selected,\n:host(.card-visual--selected) .card-visual {\n  box-shadow: 0 0 0 3px rgba(244, 211, 94, 0.85);\n  transform: translateY(-2px);\n}\n.card-visual--animation-play,\n:host(.card-visual--animation-play) .card-visual {\n  transform: translateY(-4px);\n  animation-name: card-play-arc;\n  animation-duration: 1000ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-capture,\n:host(.card-visual--animation-capture) .card-visual {\n  opacity: 0;\n  transform: scale(0.5);\n  box-shadow: 0 0 0 3px rgba(245, 197, 66, 0.75), 0 0 16px rgba(217, 160, 42, 0.55);\n  animation-name: card-capture-fade;\n  animation-duration: 900ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-deal,\n:host(.card-visual--animation-deal) .card-visual {\n  transform: translateY(-3px) scale(1.01);\n  animation-name: card-deal-slide;\n  animation-duration: 1000ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-opponent,\n:host(.card-visual--animation-opponent) .card-visual {\n  transform: translateY(-2px) scale(0.99);\n  animation-name: card-opponent-play;\n  animation-duration: 1000ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--animation-escoba,\n:host(.card-visual--animation-escoba) .card-visual {\n  opacity: 0;\n  transform: scale(0.2);\n  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.75), 0 0 18px rgba(249, 115, 22, 0.5);\n  animation-name: card-escoba-burst;\n  animation-duration: 700ms;\n  animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);\n  animation-delay: 0ms;\n  animation-fill-mode: both;\n}\n.card-visual--focus-visible:focus-visible,\n:host(.card-visual--focus-visible):focus-visible .card-visual {\n  outline: 3px solid rgba(56, 189, 248, 0.95);\n  outline-offset: 3px;\n}\n@keyframes card-play-arc {\n  0% {\n    transform: translateY(0);\n  }\n  50% {\n    transform: translateY(-8px);\n  }\n  100% {\n    transform: translateY(-4px);\n  }\n}\n@keyframes card-capture-fade {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  35% {\n    opacity: 0.85;\n    transform: scale(0.96);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.5);\n  }\n}\n@keyframes card-deal-slide {\n  0% {\n    opacity: 0.25;\n    transform: translateY(-18px) scale(0.95);\n  }\n  45% {\n    opacity: 0.8;\n    transform: translateY(-10px) scale(0.99);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(-3px) scale(1.01);\n  }\n}\n@keyframes card-opponent-play {\n  0% {\n    opacity: 0.7;\n    transform: translateY(0) scale(1);\n  }\n  50% {\n    opacity: 0.9;\n    transform: translateY(-7px) scale(0.995);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(-2px) scale(0.99);\n  }\n}\n@keyframes card-escoba-burst {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.85), 0 0 22px rgba(249, 115, 22, 0.65);\n  }\n  35% {\n    opacity: 0.9;\n    transform: scale(1.08);\n    box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.9), 0 0 26px rgba(251, 146, 60, 0.7);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.2);\n    box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.15), 0 0 10px rgba(251, 191, 36, 0.1);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .card-visual,\n  .card-visual--animation-play,\n  :host(.card-visual--animation-play) .card-visual,\n  .card-visual--animation-capture,\n  :host(.card-visual--animation-capture) .card-visual,\n  .card-visual--animation-deal,\n  :host(.card-visual--animation-deal) .card-visual,\n  .card-visual--animation-opponent,\n  :host(.card-visual--animation-opponent) .card-visual,\n  .card-visual--animation-escoba,\n  :host(.card-visual--animation-escoba) .card-visual {\n    transition-duration: 0ms;\n    animation-duration: 0ms;\n    animation-delay: 0ms;\n    animation-iteration-count: 1;\n  }\n}\n/*# sourceMappingURL=card-visual.css.map */\n"] }]
  }], null, { card: [{
    type: Input
  }], selected: [{
    type: Input
  }], faceDown: [{
    type: Input
  }], testId: [{
    type: Input
  }], mirrorStateToFigure: [{
    type: Input
  }], animationState: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardVisual, { className: "CardVisual", filePath: "src/app/features/game-board/game-table-page/components/card-visual/card-visual.ts", lineNumber: 31 });
})();

// src/app/features/game-board/game-table-page/zones/active-hand-zone/active-hand-zone.ts
function ActiveHandZone_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "button", 2);
    \u0275\u0275listener("click", function ActiveHandZone_For_2_Template_button_click_1_listener() {
      const card_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.selectHandCard(card_r2));
    });
    \u0275\u0275element(2, "app-card-visual", 3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const card_r2 = ctx.$implicit;
    const \u0275$index_3_r4 = ctx.$index;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275attribute("data-testid", "active-hand-card-" + \u0275$index_3_r4)("aria-pressed", ctx_r2.isSelected(card_r2) ? "true" : "false");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r2.interactionEnabledSignal() && !ctx_r2.preserveFocusOrderWhenBlockedSignal());
    \u0275\u0275attribute("data-testid", "hand-card-" + \u0275$index_3_r4)("aria-label", ctx_r2.handCardLabel(card_r2))("aria-pressed", ctx_r2.isSelected(card_r2) ? "true" : "false")("aria-disabled", !ctx_r2.interactionEnabledSignal() ? "true" : "false");
    \u0275\u0275advance();
    \u0275\u0275property("card", card_r2)("selected", ctx_r2.isSelected(card_r2))("mirrorStateToFigure", false)("animationState", ctx_r2.animationStateForCard(card_r2));
  }
}
var ActiveHandZone = class _ActiveHandZone {
  handCardsState = signal([], ...ngDevMode ? [{ debugName: "handCardsState" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedHandCardState = signal(null, ...ngDevMode ? [{ debugName: "selectedHandCardState" }] : (
    /* istanbul ignore next */
    []
  ));
  interactionEnabledState = signal(true, ...ngDevMode ? [{ debugName: "interactionEnabledState" }] : (
    /* istanbul ignore next */
    []
  ));
  preserveFocusOrderWhenBlockedState = signal(false, ...ngDevMode ? [{ debugName: "preserveFocusOrderWhenBlockedState" }] : (
    /* istanbul ignore next */
    []
  ));
  animationMetadataState = signal(null, ...ngDevMode ? [{ debugName: "animationMetadataState" }] : (
    /* istanbul ignore next */
    []
  ));
  handCardsSignal = this.handCardsState.asReadonly();
  selectedHandCardSignal = this.selectedHandCardState.asReadonly();
  interactionEnabledSignal = this.interactionEnabledState.asReadonly();
  preserveFocusOrderWhenBlockedSignal = this.preserveFocusOrderWhenBlockedState.asReadonly();
  animationMetadataSignal = this.animationMetadataState.asReadonly();
  handCardSelected = output();
  set handCards(cards) {
    this.handCardsState.set(cards ?? []);
  }
  get handCards() {
    return this.handCardsState();
  }
  set selectedHandCard(card) {
    this.selectedHandCardState.set(card);
  }
  get selectedHandCard() {
    return this.selectedHandCardState();
  }
  set interactionEnabled(enabled) {
    this.interactionEnabledState.set(enabled ?? true);
  }
  get interactionEnabled() {
    return this.interactionEnabledState();
  }
  set preserveFocusOrderWhenBlocked(preserve) {
    this.preserveFocusOrderWhenBlockedState.set(preserve ?? false);
  }
  get preserveFocusOrderWhenBlocked() {
    return this.preserveFocusOrderWhenBlockedState();
  }
  set animationMetadata(metadata) {
    this.animationMetadataState.set(metadata);
  }
  get animationMetadata() {
    return this.animationMetadataState();
  }
  isSelected(card) {
    return this.selectedHandCardSignal() === card;
  }
  selectHandCard(card) {
    if (!this.interactionEnabledSignal()) {
      return;
    }
    this.handCardSelected.emit(card);
  }
  animationStateForCard(card) {
    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return null;
    }
    return metadata.hand.find((entry) => entry.card === card || this.areCardsEqual(entry.card, card))?.animationState ?? null;
  }
  handCardLabel(card) {
    return `${card.rank} de ${card.suit}`;
  }
  areCardsEqual(left, right) {
    return left.suit === right.suit && left.rank === right.rank && left.value === right.value;
  }
  static \u0275fac = function ActiveHandZone_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ActiveHandZone)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ActiveHandZone, selectors: [["app-active-hand-zone"]], inputs: { handCards: "handCards", selectedHandCard: "selectedHandCard", interactionEnabled: "interactionEnabled", preserveFocusOrderWhenBlocked: "preserveFocusOrderWhenBlocked", animationMetadata: "animationMetadata" }, outputs: { handCardSelected: "handCardSelected" }, decls: 3, vars: 0, consts: [["data-testid", "active-hand-zone", "aria-label", "Active hand zone", 1, "active-hand-zone"], [1, "active-hand-card"], ["type", "button", 1, "hand-card-button", 3, "click", "disabled"], [3, "card", "selected", "mirrorStateToFigure", "animationState"]], template: function ActiveHandZone_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "section", 0);
      \u0275\u0275repeaterCreate(1, ActiveHandZone_For_2_Template, 3, 11, "div", 1, \u0275\u0275repeaterTrackByIndex);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.handCardsSignal());
    }
  }, dependencies: [CardVisual], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\n.active-hand-zone[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  border-radius: 0.75rem;\n  background: rgba(255, 255, 255, 0.12);\n}\n.active-hand-card[_ngcontent-%COMP%] {\n  inline-size: clamp(2.75rem, 19vw, 4.5rem);\n  block-size: clamp(3.75rem, 27vw, 5.5rem);\n  display: block;\n}\n.hand-card-button[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  padding: 0;\n  border: 1px solid rgba(255, 255, 255, 0.4);\n  border-radius: 0.5rem;\n  background: transparent;\n  overflow: hidden;\n}\n.card-rank[_ngcontent-%COMP%], \n.card-suit[_ngcontent-%COMP%] {\n  display: block;\n}\n/*# sourceMappingURL=active-hand-zone.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ActiveHandZone, [{
    type: Component,
    args: [{ selector: "app-active-hand-zone", imports: [CardVisual], template: `<section class="active-hand-zone" data-testid="active-hand-zone" aria-label="Active hand zone">
  @for (card of handCardsSignal(); track $index; let cardIndex = $index) {
    <div
      class="active-hand-card"
      [attr.data-testid]="'active-hand-card-' + cardIndex"
      [attr.aria-pressed]="isSelected(card) ? 'true' : 'false'"
    >
      <button
        type="button"
        class="hand-card-button"
        [attr.data-testid]="'hand-card-' + cardIndex"
        [attr.aria-label]="handCardLabel(card)"
        [attr.aria-pressed]="isSelected(card) ? 'true' : 'false'"
        [attr.aria-disabled]="!interactionEnabledSignal() ? 'true' : 'false'"
        [disabled]="!interactionEnabledSignal() && !preserveFocusOrderWhenBlockedSignal()"
        (click)="selectHandCard(card)"
      >
        <app-card-visual
          [card]="card"
          [selected]="isSelected(card)"
          [mirrorStateToFigure]="false"
          [animationState]="animationStateForCard(card)"
        ></app-card-visual>
      </button>
    </div>
  }
</section>
`, styles: ["/* src/app/features/game-board/game-table-page/zones/active-hand-zone/active-hand-zone.scss */\n:host {\n  display: block;\n}\n.active-hand-zone {\n  display: flex;\n  justify-content: center;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  border-radius: 0.75rem;\n  background: rgba(255, 255, 255, 0.12);\n}\n.active-hand-card {\n  inline-size: clamp(2.75rem, 19vw, 4.5rem);\n  block-size: clamp(3.75rem, 27vw, 5.5rem);\n  display: block;\n}\n.hand-card-button {\n  width: 100%;\n  height: 100%;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  padding: 0;\n  border: 1px solid rgba(255, 255, 255, 0.4);\n  border-radius: 0.5rem;\n  background: transparent;\n  overflow: hidden;\n}\n.card-rank,\n.card-suit {\n  display: block;\n}\n/*# sourceMappingURL=active-hand-zone.css.map */\n"] }]
  }], null, { handCardSelected: [{ type: Output, args: ["handCardSelected"] }], handCards: [{
    type: Input
  }], selectedHandCard: [{
    type: Input
  }], interactionEnabled: [{
    type: Input
  }], preserveFocusOrderWhenBlocked: [{
    type: Input
  }], animationMetadata: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ActiveHandZone, { className: "ActiveHandZone", filePath: "src/app/features/game-board/game-table-page/zones/active-hand-zone/active-hand-zone.ts", lineNumber: 15 });
})();

// src/app/features/game-board/game-table-page/zones/center-table-zone/center-table-zone.ts
function CenterTableZone_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 2);
    \u0275\u0275listener("click", function CenterTableZone_For_2_Template_button_click_0_listener() {
      const card_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleTableCard(card_r2));
    });
    \u0275\u0275element(1, "app-card-visual", 3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const card_r2 = ctx.$implicit;
    const \u0275$index_3_r4 = ctx.$index;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("disabled", !ctx_r2.interactionEnabledSignal() && !ctx_r2.preserveFocusOrderWhenBlockedSignal());
    \u0275\u0275attribute("data-testid", "table-card-" + \u0275$index_3_r4)("aria-label", ctx_r2.tableCardLabel(card_r2))("aria-selected", ctx_r2.isSelected(card_r2) ? "true" : "false")("aria-disabled", !ctx_r2.interactionEnabledSignal() ? "true" : "false");
    \u0275\u0275advance();
    \u0275\u0275property("card", card_r2)("selected", ctx_r2.isSelected(card_r2))("mirrorStateToFigure", false)("animationState", ctx_r2.animationStateForCard(card_r2));
  }
}
var CenterTableZone = class _CenterTableZone {
  tableCardsState = signal([], ...ngDevMode ? [{ debugName: "tableCardsState" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedTableCardsState = signal([], ...ngDevMode ? [{ debugName: "selectedTableCardsState" }] : (
    /* istanbul ignore next */
    []
  ));
  interactionEnabledState = signal(true, ...ngDevMode ? [{ debugName: "interactionEnabledState" }] : (
    /* istanbul ignore next */
    []
  ));
  preserveFocusOrderWhenBlockedState = signal(false, ...ngDevMode ? [{ debugName: "preserveFocusOrderWhenBlockedState" }] : (
    /* istanbul ignore next */
    []
  ));
  animationMetadataState = signal(null, ...ngDevMode ? [{ debugName: "animationMetadataState" }] : (
    /* istanbul ignore next */
    []
  ));
  tableCardsSignal = this.tableCardsState.asReadonly();
  selectedTableCardsSignal = this.selectedTableCardsState.asReadonly();
  interactionEnabledSignal = this.interactionEnabledState.asReadonly();
  preserveFocusOrderWhenBlockedSignal = this.preserveFocusOrderWhenBlockedState.asReadonly();
  animationMetadataSignal = this.animationMetadataState.asReadonly();
  tableCardToggled = output();
  set tableCards(cards) {
    this.tableCardsState.set(cards ?? []);
  }
  get tableCards() {
    return this.tableCardsState();
  }
  set selectedTableCards(cards) {
    this.selectedTableCardsState.set(cards ?? []);
  }
  get selectedTableCards() {
    return this.selectedTableCardsState();
  }
  set interactionEnabled(enabled) {
    this.interactionEnabledState.set(enabled ?? true);
  }
  get interactionEnabled() {
    return this.interactionEnabledState();
  }
  set preserveFocusOrderWhenBlocked(preserve) {
    this.preserveFocusOrderWhenBlockedState.set(preserve ?? false);
  }
  get preserveFocusOrderWhenBlocked() {
    return this.preserveFocusOrderWhenBlockedState();
  }
  set animationMetadata(metadata) {
    this.animationMetadataState.set(metadata);
  }
  get animationMetadata() {
    return this.animationMetadataState();
  }
  isSelected(card) {
    return this.selectedTableCardsSignal().includes(card);
  }
  toggleTableCard(card) {
    if (!this.interactionEnabledSignal()) {
      return;
    }
    this.tableCardToggled.emit(card);
  }
  animationStateForCard(card) {
    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return null;
    }
    return metadata.table.find((entry) => entry.card === card || this.areCardsEqual(entry.card, card))?.animationState ?? null;
  }
  tableCardLabel(card) {
    return `${card.rank} de ${card.suit}`;
  }
  areCardsEqual(left, right) {
    return left.suit === right.suit && left.rank === right.rank && left.value === right.value;
  }
  static \u0275fac = function CenterTableZone_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CenterTableZone)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CenterTableZone, selectors: [["app-center-table-zone"]], inputs: { tableCards: "tableCards", selectedTableCards: "selectedTableCards", interactionEnabled: "interactionEnabled", preserveFocusOrderWhenBlocked: "preserveFocusOrderWhenBlocked", animationMetadata: "animationMetadata" }, outputs: { tableCardToggled: "tableCardToggled" }, decls: 3, vars: 0, consts: [["data-testid", "center-table-zone", "aria-label", "Center table zone", "role", "listbox", "aria-multiselectable", "true", 1, "center-table-zone"], ["type", "button", "role", "option", 1, "table-card", 3, "disabled"], ["type", "button", "role", "option", 1, "table-card", 3, "click", "disabled"], [3, "card", "selected", "mirrorStateToFigure", "animationState"]], template: function CenterTableZone_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "section", 0);
      \u0275\u0275repeaterCreate(1, CenterTableZone_For_2_Template, 2, 9, "button", 1, \u0275\u0275repeaterTrackByIndex);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.tableCardsSignal());
    }
  }, dependencies: [CardVisual], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\n.center-table-zone[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(2.75rem, 4.5rem));\n  justify-content: center;\n  gap: 0.5rem;\n  min-height: 10rem;\n  padding: 0.75rem;\n  border-radius: 0.75rem;\n  background: rgba(20, 67, 45, 0.65);\n}\n.table-card[_ngcontent-%COMP%] {\n  min-height: clamp(2.75rem, 18vw, 5.5rem);\n  min-width: 2.75rem;\n  padding: 0;\n  border: 1px solid rgba(255, 255, 255, 0.4);\n  border-radius: 0.5rem;\n  background: transparent;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  gap: 0.25rem;\n  overflow: hidden;\n}\n.card-rank[_ngcontent-%COMP%], \n.card-suit[_ngcontent-%COMP%] {\n  display: block;\n}\n/*# sourceMappingURL=center-table-zone.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CenterTableZone, [{
    type: Component,
    args: [{ selector: "app-center-table-zone", imports: [CardVisual], template: `<section
  class="center-table-zone"
  data-testid="center-table-zone"
  aria-label="Center table zone"
  role="listbox"
  aria-multiselectable="true"
>
  @for (card of tableCardsSignal(); track $index; let cardIndex = $index) {
    <button
      type="button"
      class="table-card"
      [attr.data-testid]="'table-card-' + cardIndex"
      [attr.aria-label]="tableCardLabel(card)"
      role="option"
      [attr.aria-selected]="isSelected(card) ? 'true' : 'false'"
      [attr.aria-disabled]="!interactionEnabledSignal() ? 'true' : 'false'"
      [disabled]="!interactionEnabledSignal() && !preserveFocusOrderWhenBlockedSignal()"
      (click)="toggleTableCard(card)"
    >
      <app-card-visual
        [card]="card"
        [selected]="isSelected(card)"
        [mirrorStateToFigure]="false"
        [animationState]="animationStateForCard(card)"
      ></app-card-visual>
    </button>
  }
</section>
`, styles: ["/* src/app/features/game-board/game-table-page/zones/center-table-zone/center-table-zone.scss */\n:host {\n  display: block;\n}\n.center-table-zone {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(2.75rem, 4.5rem));\n  justify-content: center;\n  gap: 0.5rem;\n  min-height: 10rem;\n  padding: 0.75rem;\n  border-radius: 0.75rem;\n  background: rgba(20, 67, 45, 0.65);\n}\n.table-card {\n  min-height: clamp(2.75rem, 18vw, 5.5rem);\n  min-width: 2.75rem;\n  padding: 0;\n  border: 1px solid rgba(255, 255, 255, 0.4);\n  border-radius: 0.5rem;\n  background: transparent;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  gap: 0.25rem;\n  overflow: hidden;\n}\n.card-rank,\n.card-suit {\n  display: block;\n}\n/*# sourceMappingURL=center-table-zone.css.map */\n"] }]
  }], null, { tableCardToggled: [{ type: Output, args: ["tableCardToggled"] }], tableCards: [{
    type: Input
  }], selectedTableCards: [{
    type: Input
  }], interactionEnabled: [{
    type: Input
  }], preserveFocusOrderWhenBlocked: [{
    type: Input
  }], animationMetadata: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CenterTableZone, { className: "CenterTableZone", filePath: "src/app/features/game-board/game-table-page/zones/center-table-zone/center-table-zone.ts", lineNumber: 15 });
})();

// src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.ts
var _forTrack0 = ($index, $item) => $item.id;
function OpponentZones_For_2_Conditional_5_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275element(1, "app-card-visual", 8);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const aiCardIndex_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275attribute("data-testid", "ai-hand-shell-" + aiCardIndex_r1);
    \u0275\u0275advance();
    \u0275\u0275property("testId", "ai-hand-card-" + aiCardIndex_r1)("card", ctx_r1.aiCardAt(aiCardIndex_r1))("faceDown", ctx_r1.isAiCardFaceDown(aiCardIndex_r1))("selected", ctx_r1.isAiCardSelected(aiCardIndex_r1))("mirrorStateToFigure", false)("animationState", ctx_r1.aiCardAnimationState(aiCardIndex_r1));
  }
}
function OpponentZones_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6);
    \u0275\u0275repeaterCreate(1, OpponentZones_For_2_Conditional_5_For_2_Template, 2, 7, "div", 7, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("ai-hand-zone--active", ctx_r1.isAiHandActive());
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.aiHandIndexes());
  }
}
function OpponentZones_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "article", 2)(1, "p", 3);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 4);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, OpponentZones_For_2_Conditional_5_Template, 3, 2, "div", 5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const opponent_r3 = ctx.$implicit;
    const \u0275$index_3_r4 = ctx.$index;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("opponent-seat--north", ctx_r1.seatPosition(\u0275$index_3_r4) === "north")("opponent-seat--west", ctx_r1.seatPosition(\u0275$index_3_r4) === "west")("opponent-seat--east", ctx_r1.seatPosition(\u0275$index_3_r4) === "east");
    \u0275\u0275attribute("data-testid", "opponent-seat-" + \u0275$index_3_r4)("data-seat-position", ctx_r1.seatPosition(\u0275$index_3_r4));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(opponent_r3.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Captured: ", opponent_r3.capturedPile.length);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isAiOpponent(opponent_r3) && ctx_r1.aiHandCardCountSignal() > 0 ? 5 : -1);
  }
}
var AI_TURN_IDLE2 = {
  phase: "idle",
  selectedCardIndex: null,
  revealedCard: null,
  highlightedTableCards: []
};
var OpponentZones = class _OpponentZones {
  opponentsState = signal([], ...ngDevMode ? [{ debugName: "opponentsState" }] : (
    /* istanbul ignore next */
    []
  ));
  aiHandCardCountState = signal(0, ...ngDevMode ? [{ debugName: "aiHandCardCountState" }] : (
    /* istanbul ignore next */
    []
  ));
  aiTurnAnimationStateState = signal(AI_TURN_IDLE2, ...ngDevMode ? [{ debugName: "aiTurnAnimationStateState" }] : (
    /* istanbul ignore next */
    []
  ));
  animationMetadataState = signal(null, ...ngDevMode ? [{ debugName: "animationMetadataState" }] : (
    /* istanbul ignore next */
    []
  ));
  suppressAiAnimationsState = signal(false, ...ngDevMode ? [{ debugName: "suppressAiAnimationsState" }] : (
    /* istanbul ignore next */
    []
  ));
  opponentsSignal = this.opponentsState.asReadonly();
  aiHandCardCountSignal = this.aiHandCardCountState.asReadonly();
  aiTurnAnimationStateSignal = this.aiTurnAnimationStateState.asReadonly();
  animationMetadataSignal = this.animationMetadataState.asReadonly();
  suppressAiAnimationsSignal = this.suppressAiAnimationsState.asReadonly();
  set opponents(players) {
    this.opponentsState.set(players ?? []);
  }
  get opponents() {
    return this.opponentsState();
  }
  set aiHandCardCount(value) {
    this.aiHandCardCountState.set(value > 0 ? value : 0);
  }
  get aiHandCardCount() {
    return this.aiHandCardCountState();
  }
  set aiTurnAnimationState(value) {
    this.aiTurnAnimationStateState.set(value ?? AI_TURN_IDLE2);
  }
  get aiTurnAnimationState() {
    return this.aiTurnAnimationStateState();
  }
  set animationMetadata(metadata) {
    this.animationMetadataState.set(metadata);
  }
  get animationMetadata() {
    return this.animationMetadataState();
  }
  set suppressAiAnimations(value) {
    this.suppressAiAnimationsState.set(Boolean(value));
  }
  get suppressAiAnimations() {
    return this.suppressAiAnimationsState();
  }
  seatPosition(index) {
    const opponentCount = this.opponentsSignal().length;
    if (opponentCount <= 1) {
      return "north";
    }
    if (opponentCount === 2) {
      return index === 0 ? "west" : "east";
    }
    if (index === 0) {
      return "west";
    }
    if (index === 1) {
      return "north";
    }
    return "east";
  }
  isAiOpponent(opponent) {
    return opponent.name === "Laia";
  }
  aiHandIndexes() {
    return Array.from({ length: this.aiHandCardCountSignal() }, (_, index) => index);
  }
  isAiHandActive() {
    const phase = this.aiTurnAnimationStateSignal().phase;
    if (phase === "idle") {
      return false;
    }
    if (phase !== "capture-previewing") {
      return true;
    }
    return !this.isOpponentMetadataNoop();
  }
  isAiCardSelected(index) {
    return this.isAiHandActive() && this.aiTurnAnimationStateSignal().selectedCardIndex === index;
  }
  aiCardAt(index) {
    if (!this.isAiCardRevealed(index)) {
      return null;
    }
    return this.aiTurnAnimationStateSignal().revealedCard;
  }
  isAiCardFaceDown(index) {
    return !this.isAiCardRevealed(index);
  }
  aiCardAnimationState(index) {
    if (this.suppressAiAnimationsSignal()) {
      return null;
    }
    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return null;
    }
    return metadata.opponent.find((entry) => entry.cardIndex === index)?.animationState ?? null;
  }
  isOpponentMetadataNoop() {
    if (this.suppressAiAnimationsSignal()) {
      return true;
    }
    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return true;
    }
    return metadata.opponent.every((entry) => entry.animationState === null);
  }
  isAiCardRevealed(index) {
    const state = this.aiTurnAnimationStateSignal();
    return state.revealedCard !== null && state.selectedCardIndex === index;
  }
  static \u0275fac = function OpponentZones_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _OpponentZones)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _OpponentZones, selectors: [["app-opponent-zones"]], inputs: { opponents: "opponents", aiHandCardCount: "aiHandCardCount", aiTurnAnimationState: "aiTurnAnimationState", animationMetadata: "animationMetadata", suppressAiAnimations: "suppressAiAnimations" }, decls: 3, vars: 6, consts: [["data-testid", "opponent-zones", "data-opponent-animation-scope", "single-player-ai-only", 1, "opponent-zones"], [1, "opponent-seat", 3, "opponent-seat--north", "opponent-seat--west", "opponent-seat--east"], [1, "opponent-seat"], [1, "opponent-name"], [1, "opponent-captured"], ["data-testid", "ai-hand-zone", 1, "ai-hand-zone", 3, "ai-hand-zone--active"], ["data-testid", "ai-hand-zone", 1, "ai-hand-zone"], [1, "ai-hand-card"], [3, "testId", "card", "faceDown", "selected", "mirrorStateToFigure", "animationState"]], template: function OpponentZones_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "section", 0);
      \u0275\u0275repeaterCreate(1, OpponentZones_For_2_Template, 6, 11, "article", 1, _forTrack0);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classProp("opponent-zones--one", ctx.opponentsSignal().length === 1)("opponent-zones--two", ctx.opponentsSignal().length === 2)("opponent-zones--three", ctx.opponentsSignal().length >= 3);
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.opponentsSignal());
    }
  }, dependencies: [CardVisual], styles: ['\n[_nghost-%COMP%] {\n  display: block;\n}\n.opponent-zones[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0.75rem;\n}\n.opponent-zones--one[_ngcontent-%COMP%] {\n  grid-template-areas: ". north .";\n}\n.opponent-zones--two[_ngcontent-%COMP%] {\n  grid-template-areas: "west . east";\n}\n.opponent-zones--three[_ngcontent-%COMP%] {\n  grid-template-areas: "west north east";\n}\n.opponent-seat[_ngcontent-%COMP%] {\n  border-radius: 0.75rem;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  background: rgba(0, 0, 0, 0.2);\n  padding: 0.5rem 0.75rem;\n}\n.opponent-seat--north[_ngcontent-%COMP%] {\n  grid-area: north;\n  justify-self: center;\n  width: min(100%, 16rem);\n}\n.opponent-seat--west[_ngcontent-%COMP%] {\n  grid-area: west;\n}\n.opponent-seat--east[_ngcontent-%COMP%] {\n  grid-area: east;\n}\n.opponent-name[_ngcontent-%COMP%], \n.opponent-captured[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.ai-hand-zone[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid rgba(255, 255, 255, 0.18);\n}\n.ai-hand-card[_ngcontent-%COMP%] {\n  flex: 0 0 auto;\n  inline-size: clamp(2.5rem, 11vw, 3.5rem);\n  block-size: clamp(3.5rem, 16vw, 4.75rem);\n  display: block;\n}\n.ai-hand-zone--active[_ngcontent-%COMP%] {\n  border-top-color: rgba(255, 225, 120, 0.8);\n}\n@media (max-width: 700px) {\n  .opponent-zones[_ngcontent-%COMP%], \n   .opponent-zones--one[_ngcontent-%COMP%], \n   .opponent-zones--two[_ngcontent-%COMP%], \n   .opponent-zones--three[_ngcontent-%COMP%] {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas: "north" "west" "east";\n  }\n  .opponent-seat[_ngcontent-%COMP%], \n   .opponent-seat--north[_ngcontent-%COMP%], \n   .opponent-seat--west[_ngcontent-%COMP%], \n   .opponent-seat--east[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-self: stretch;\n  }\n}\n/*# sourceMappingURL=opponent-zones.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OpponentZones, [{
    type: Component,
    args: [{ selector: "app-opponent-zones", imports: [CardVisual], template: `<section
  class="opponent-zones"
  data-testid="opponent-zones"
  data-opponent-animation-scope="single-player-ai-only"
  [class.opponent-zones--one]="opponentsSignal().length === 1"
  [class.opponent-zones--two]="opponentsSignal().length === 2"
  [class.opponent-zones--three]="opponentsSignal().length >= 3"
>
  @for (opponent of opponentsSignal(); track opponent.id; let opponentIndex = $index) {
    <article
      class="opponent-seat"
      [attr.data-testid]="'opponent-seat-' + opponentIndex"
      [attr.data-seat-position]="seatPosition(opponentIndex)"
      [class.opponent-seat--north]="seatPosition(opponentIndex) === 'north'"
      [class.opponent-seat--west]="seatPosition(opponentIndex) === 'west'"
      [class.opponent-seat--east]="seatPosition(opponentIndex) === 'east'"
    >
      <p class="opponent-name">{{ opponent.name }}</p>
      <p class="opponent-captured">Captured: {{ opponent.capturedPile.length }}</p>

      @if (isAiOpponent(opponent) && aiHandCardCountSignal() > 0) {
        <div
          class="ai-hand-zone"
          data-testid="ai-hand-zone"
          [class.ai-hand-zone--active]="isAiHandActive()"
        >
          @for (aiCardIndex of aiHandIndexes(); track aiCardIndex) {
            <div class="ai-hand-card" [attr.data-testid]="'ai-hand-shell-' + aiCardIndex">
              <app-card-visual
                [testId]="'ai-hand-card-' + aiCardIndex"
                [card]="aiCardAt(aiCardIndex)"
                [faceDown]="isAiCardFaceDown(aiCardIndex)"
                [selected]="isAiCardSelected(aiCardIndex)"
                [mirrorStateToFigure]="false"
                [animationState]="aiCardAnimationState(aiCardIndex)"
              ></app-card-visual>
            </div>
          }
        </div>
      }
    </article>
  }
</section>
`, styles: ['/* src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.scss */\n:host {\n  display: block;\n}\n.opponent-zones {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0.75rem;\n}\n.opponent-zones--one {\n  grid-template-areas: ". north .";\n}\n.opponent-zones--two {\n  grid-template-areas: "west . east";\n}\n.opponent-zones--three {\n  grid-template-areas: "west north east";\n}\n.opponent-seat {\n  border-radius: 0.75rem;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  background: rgba(0, 0, 0, 0.2);\n  padding: 0.5rem 0.75rem;\n}\n.opponent-seat--north {\n  grid-area: north;\n  justify-self: center;\n  width: min(100%, 16rem);\n}\n.opponent-seat--west {\n  grid-area: west;\n}\n.opponent-seat--east {\n  grid-area: east;\n}\n.opponent-name,\n.opponent-captured {\n  margin: 0;\n}\n.ai-hand-zone {\n  display: flex;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid rgba(255, 255, 255, 0.18);\n}\n.ai-hand-card {\n  flex: 0 0 auto;\n  inline-size: clamp(2.5rem, 11vw, 3.5rem);\n  block-size: clamp(3.5rem, 16vw, 4.75rem);\n  display: block;\n}\n.ai-hand-zone--active {\n  border-top-color: rgba(255, 225, 120, 0.8);\n}\n@media (max-width: 700px) {\n  .opponent-zones,\n  .opponent-zones--one,\n  .opponent-zones--two,\n  .opponent-zones--three {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas: "north" "west" "east";\n  }\n  .opponent-seat,\n  .opponent-seat--north,\n  .opponent-seat--west,\n  .opponent-seat--east {\n    width: 100%;\n    justify-self: stretch;\n  }\n}\n/*# sourceMappingURL=opponent-zones.css.map */\n'] }]
  }], null, { opponents: [{
    type: Input
  }], aiHandCardCount: [{
    type: Input
  }], aiTurnAnimationState: [{
    type: Input
  }], animationMetadata: [{
    type: Input
  }], suppressAiAnimations: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(OpponentZones, { className: "OpponentZones", filePath: "src/app/features/game-board/game-table-page/zones/opponent-zones/opponent-zones.ts", lineNumber: 37 });
})();

// src/app/features/game-board/game-table-page/components/match-context-hud/match-context-hud.ts
var _forTrack02 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.playerName;
var arrowFn0 = (ctx, view) => (winner) => winner.name;
function MatchContextHud_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "p", 4)(1, "span", 13);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "span", 14);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const entry_r1 = ctx.$implicit;
    const \u0275$index_11_r2 = ctx.$index;
    \u0275\u0275attribute("data-testid", "score-item-" + \u0275$index_11_r2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r1.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r1.score);
  }
}
function MatchContextHud_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "p", 5);
    \u0275\u0275text(1, "Scores pending");
    \u0275\u0275domElementEnd();
  }
}
function MatchContextHud_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "p", 7);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const escobaOutcome_r3 = ctx;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" Escoba: ", escobaOutcome_r3.playerName, " (", escobaOutcome_r3.escobaCount, ") ");
  }
}
function MatchContextHud_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "p", 8);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" Round ", ctx.roundNumber, " resolved. Top score: ", ctx_r3.roundTopScoreSignal(), " ");
  }
}
function MatchContextHud_Conditional_13_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 16)(1, "p", 17);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "p");
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(5, "p");
    \u0275\u0275text(6);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(7, "p");
    \u0275\u0275text(8);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(9, "p");
    \u0275\u0275text(10);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(11, "p");
    \u0275\u0275text(12);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(13, "p");
    \u0275\u0275text(14);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const entry_r5 = ctx.$implicit;
    const \u0275$index_41_r6 = ctx.$index;
    \u0275\u0275attribute("data-testid", "round-score-player-" + \u0275$index_41_r6);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r5.playerName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Escobas: ", entry_r5.escobas);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("M\xE1s cartas: ", entry_r5.mostCards);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("M\xE1s oros: ", entry_r5.mostOros);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("M\xE1s sietes: ", entry_r5.mostSevens);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Siete de Oros: ", entry_r5.sieteDiVelo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Total: ", entry_r5.total);
  }
}
function MatchContextHud_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "section", 9)(1, "h3", 15);
    \u0275\u0275text(2, "Desglose de puntuaci\xF3n de la ronda");
    \u0275\u0275domElementEnd();
    \u0275\u0275repeaterCreate(3, MatchContextHud_Conditional_13_For_4_Template, 15, 8, "div", 16, _forTrack1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r3.roundScoreBreakdownSignal());
  }
}
function MatchContextHud_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 18);
    \u0275\u0275domListener("click", function MatchContextHud_Conditional_14_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onViewWinnerClick());
    })("keydown.enter", function MatchContextHud_Conditional_14_Template_button_keydown_enter_0_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onViewWinnerEnter($event));
    });
    \u0275\u0275text(1, " Ver ganador ");
    \u0275\u0275domElementEnd();
  }
}
function MatchContextHud_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 19);
    \u0275\u0275domListener("click", function MatchContextHud_Conditional_15_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onStartNextRoundClick());
    })("keydown.enter", function MatchContextHud_Conditional_15_Template_button_keydown_enter_0_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onStartNextRoundEnter($event));
    });
    \u0275\u0275text(1, " Empezar siguiente ronda ");
    \u0275\u0275domElementEnd();
  }
}
function MatchContextHud_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "p", 12);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Match winner: ", ctx.map(\u0275\u0275arrowFunction(1, arrowFn0, ctx)).join(", "), " ");
  }
}
var MatchContextHud = class _MatchContextHud {
  activePlayerNameState = signal("No active player", ...ngDevMode ? [{ debugName: "activePlayerNameState" }] : (
    /* istanbul ignore next */
    []
  ));
  currentRoundNumberState = signal(0, ...ngDevMode ? [{ debugName: "currentRoundNumberState" }] : (
    /* istanbul ignore next */
    []
  ));
  scoreEntriesState = signal([], ...ngDevMode ? [{ debugName: "scoreEntriesState" }] : (
    /* istanbul ignore next */
    []
  ));
  turnPhaseState = signal("awaiting-card-play", ...ngDevMode ? [{ debugName: "turnPhaseState" }] : (
    /* istanbul ignore next */
    []
  ));
  escobaOutcomeState = signal(null, ...ngDevMode ? [{ debugName: "escobaOutcomeState" }] : (
    /* istanbul ignore next */
    []
  ));
  roundResultState = signal(null, ...ngDevMode ? [{ debugName: "roundResultState" }] : (
    /* istanbul ignore next */
    []
  ));
  matchWinnerState = signal(null, ...ngDevMode ? [{ debugName: "matchWinnerState" }] : (
    /* istanbul ignore next */
    []
  ));
  showStartNextRoundState = signal(false, ...ngDevMode ? [{ debugName: "showStartNextRoundState" }] : (
    /* istanbul ignore next */
    []
  ));
  showViewWinnerState = signal(false, ...ngDevMode ? [{ debugName: "showViewWinnerState" }] : (
    /* istanbul ignore next */
    []
  ));
  roundScoreBreakdownState = signal([], ...ngDevMode ? [{ debugName: "roundScoreBreakdownState" }] : (
    /* istanbul ignore next */
    []
  ));
  handoffActiveState = signal(false, ...ngDevMode ? [{ debugName: "handoffActiveState" }] : (
    /* istanbul ignore next */
    []
  ));
  contextHeaderTestIdState = signal("context-header", ...ngDevMode ? [{ debugName: "contextHeaderTestIdState" }] : (
    /* istanbul ignore next */
    []
  ));
  activePlayerNameSignal = this.activePlayerNameState.asReadonly();
  currentRoundNumberSignal = this.currentRoundNumberState.asReadonly();
  scoreEntriesSignal = this.scoreEntriesState.asReadonly();
  turnPhaseSignal = this.turnPhaseState.asReadonly();
  escobaOutcomeSignal = this.escobaOutcomeState.asReadonly();
  roundResultSignal = this.roundResultState.asReadonly();
  matchWinnerSignal = this.matchWinnerState.asReadonly();
  showStartNextRoundSignal = this.showStartNextRoundState.asReadonly();
  showViewWinnerSignal = this.showViewWinnerState.asReadonly();
  roundScoreBreakdownSignal = this.roundScoreBreakdownState.asReadonly();
  roundTopScoreSignal = computed(() => {
    const roundResult = this.roundResultSignal();
    if (!roundResult || roundResult.playerScores.length === 0) {
      return 0;
    }
    return roundResult.playerScores.reduce((maxScore, entry) => {
      return Math.max(maxScore, entry.total);
    }, 0);
  }, ...ngDevMode ? [{ debugName: "roundTopScoreSignal" }] : (
    /* istanbul ignore next */
    []
  ));
  handoffActiveSignal = this.handoffActiveState.asReadonly();
  contextHeaderTestIdSignal = this.contextHeaderTestIdState.asReadonly();
  startNextRound = output();
  viewWinner = output();
  set activePlayerName(value) {
    this.activePlayerNameState.set(value ?? "No active player");
  }
  get activePlayerName() {
    return this.activePlayerNameState();
  }
  set currentRoundNumber(value) {
    this.currentRoundNumberState.set(value ?? 0);
  }
  get currentRoundNumber() {
    return this.currentRoundNumberState();
  }
  set scoreEntries(value) {
    this.scoreEntriesState.set(value ?? []);
  }
  get scoreEntries() {
    return this.scoreEntriesState();
  }
  set turnPhase(value) {
    this.turnPhaseState.set(value ?? "awaiting-card-play");
  }
  get turnPhase() {
    return this.turnPhaseState();
  }
  set escobaOutcome(value) {
    this.escobaOutcomeState.set(value ?? null);
  }
  get escobaOutcome() {
    return this.escobaOutcomeState();
  }
  set roundResult(value) {
    this.roundResultState.set(value ?? null);
  }
  get roundResult() {
    return this.roundResultState();
  }
  set matchWinner(value) {
    this.matchWinnerState.set(value ?? null);
  }
  get matchWinner() {
    return this.matchWinnerState();
  }
  set showStartNextRound(value) {
    this.showStartNextRoundState.set(value ?? false);
  }
  get showStartNextRound() {
    return this.showStartNextRoundState();
  }
  set showViewWinner(value) {
    this.showViewWinnerState.set(value ?? false);
  }
  get showViewWinner() {
    return this.showViewWinnerState();
  }
  set roundScoreBreakdown(value) {
    this.roundScoreBreakdownState.set(value ?? []);
  }
  get roundScoreBreakdown() {
    return this.roundScoreBreakdownState();
  }
  set handoffActive(value) {
    this.handoffActiveState.set(value ?? false);
  }
  get handoffActive() {
    return this.handoffActiveState();
  }
  set contextHeaderTestId(value) {
    this.contextHeaderTestIdState.set(value ?? null);
  }
  get contextHeaderTestId() {
    return this.contextHeaderTestIdState();
  }
  onStartNextRound() {
    this.startNextRound.emit();
  }
  onViewWinner() {
    this.viewWinner.emit();
  }
  onStartNextRoundClick() {
    this.onStartNextRound();
  }
  onStartNextRoundEnter(event) {
    event.preventDefault();
    const trigger = event.currentTarget;
    if (trigger instanceof HTMLButtonElement) {
      trigger.click();
      return;
    }
    this.onStartNextRound();
  }
  onViewWinnerClick() {
    this.onViewWinner();
  }
  onViewWinnerEnter(event) {
    event.preventDefault();
    const trigger = event.currentTarget;
    if (trigger instanceof HTMLButtonElement) {
      trigger.click();
      return;
    }
    this.onViewWinner();
  }
  static \u0275fac = function MatchContextHud_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatchContextHud)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MatchContextHud, selectors: [["app-match-context-hud"]], inputs: { activePlayerName: "activePlayerName", currentRoundNumber: "currentRoundNumber", scoreEntries: "scoreEntries", turnPhase: "turnPhase", escobaOutcome: "escobaOutcome", roundResult: "roundResult", matchWinner: "matchWinner", showStartNextRound: "showStartNextRound", showViewWinner: "showViewWinner", roundScoreBreakdown: "roundScoreBreakdown", handoffActive: "handoffActive", contextHeaderTestId: "contextHeaderTestId" }, outputs: { startNextRound: "startNextRound", viewWinner: "viewWinner" }, decls: 17, vars: 12, consts: [[1, "context-header"], ["data-testid", "active-player-indicator"], ["data-testid", "current-round-indicator"], ["data-testid", "scoreboard-indicator", "aria-label", "Match scores", 1, "scoreboard"], [1, "score-item"], [1, "score-empty"], ["data-testid", "turn-phase-indicator"], ["data-testid", "escoba-outcome-indicator", 1, "escoba-outcome-indicator"], ["data-testid", "round-outcome-indicator", 1, "round-outcome-indicator"], ["data-testid", "round-score-breakdown", 1, "round-score-breakdown"], ["type", "button", "data-testid", "view-winner-button", "aria-label", "Ver ganador", 1, "round-action-button"], ["type", "button", "data-testid", "start-next-round-button", "aria-label", "Empezar siguiente ronda", 1, "round-action-button"], ["data-testid", "match-winner-indicator", 1, "match-winner-indicator"], [1, "score-label"], [1, "score-value"], [1, "round-score-breakdown-title"], [1, "round-score-player"], [1, "round-score-player-name"], ["type", "button", "data-testid", "view-winner-button", "aria-label", "Ver ganador", 1, "round-action-button", 3, "click", "keydown.enter"], ["type", "button", "data-testid", "start-next-round-button", "aria-label", "Empezar siguiente ronda", 1, "round-action-button", 3, "click", "keydown.enter"]], template: function MatchContextHud_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "header", 0)(1, "p", 1);
      \u0275\u0275text(2);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(3, "p", 2);
      \u0275\u0275text(4);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(5, "div", 3);
      \u0275\u0275repeaterCreate(6, MatchContextHud_For_7_Template, 5, 3, "p", 4, _forTrack02);
      \u0275\u0275conditionalCreate(8, MatchContextHud_Conditional_8_Template, 2, 0, "p", 5);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(9, "p", 6);
      \u0275\u0275text(10);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(11, MatchContextHud_Conditional_11_Template, 2, 2, "p", 7);
      \u0275\u0275conditionalCreate(12, MatchContextHud_Conditional_12_Template, 2, 2, "p", 8);
      \u0275\u0275conditionalCreate(13, MatchContextHud_Conditional_13_Template, 5, 0, "section", 9);
      \u0275\u0275conditionalCreate(14, MatchContextHud_Conditional_14_Template, 2, 0, "button", 10)(15, MatchContextHud_Conditional_15_Template, 2, 0, "button", 11);
      \u0275\u0275conditionalCreate(16, MatchContextHud_Conditional_16_Template, 2, 2, "p", 12);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      let tmp_8_0;
      let tmp_9_0;
      let tmp_12_0;
      \u0275\u0275attribute("data-testid", ctx.contextHeaderTestIdSignal())("aria-hidden", ctx.handoffActiveSignal() ? "true" : null)("inert", ctx.handoffActiveSignal() ? "" : null);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1("Active player: ", ctx.activePlayerNameSignal());
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1("Round: ", ctx.currentRoundNumberSignal());
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.scoreEntriesSignal());
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.scoreEntriesSignal().length === 0 ? 8 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1("Turn phase: ", ctx.turnPhaseSignal());
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_8_0 = ctx.escobaOutcomeSignal()) ? 11 : -1, tmp_8_0);
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_9_0 = ctx.roundResultSignal()) ? 12 : -1, tmp_9_0);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.roundScoreBreakdownSignal().length > 0 ? 13 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showViewWinnerSignal() ? 14 : ctx.showStartNextRoundSignal() ? 15 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional((tmp_12_0 = ctx.matchWinnerSignal()) ? 16 : -1, tmp_12_0);
    }
  }, styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\n.context-header[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);\n  align-items: center;\n  gap: 1rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 0.75rem;\n  border: 1px solid rgba(241, 226, 189, 0.24);\n  background: rgba(4, 11, 9, 0.72);\n  -webkit-backdrop-filter: blur(2px);\n  backdrop-filter: blur(2px);\n}\n.scoreboard[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.score-item[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.375rem;\n  margin: 0;\n  padding: 0.25rem 0.5rem;\n  border-radius: 999px;\n  background: rgba(241, 226, 189, 0.2);\n}\n.score-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n.score-value[_ngcontent-%COMP%] {\n  font-weight: 700;\n}\n.score-empty[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.escoba-outcome-indicator[_ngcontent-%COMP%], \n.round-outcome-indicator[_ngcontent-%COMP%], \n.match-winner-indicator[_ngcontent-%COMP%] {\n  margin: 0;\n  grid-column: 1/-1;\n  padding: 0.375rem 0.5rem;\n  border-radius: 0.5rem;\n  background: rgba(241, 226, 189, 0.16);\n  font-weight: 600;\n}\n.round-score-breakdown[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0.625rem;\n  border-radius: 0.625rem;\n  background: rgba(241, 226, 189, 0.16);\n}\n.round-score-breakdown-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.95rem;\n}\n.round-score-player[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(8.25rem, 1fr));\n  gap: 0.25rem 0.75rem;\n  padding: 0.5rem;\n  border-radius: 0.5rem;\n  background: rgba(4, 11, 9, 0.36);\n}\n.round-score-player[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.round-score-player-name[_ngcontent-%COMP%] {\n  font-weight: 700;\n}\n.round-action-button[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n  justify-self: start;\n}\n@media (max-width: 700px) {\n  .context-header[_ngcontent-%COMP%] {\n    grid-template-columns: minmax(0, 1fr);\n    justify-items: start;\n    gap: 0.625rem;\n  }\n  .scoreboard[_ngcontent-%COMP%] {\n    justify-content: flex-start;\n  }\n  .round-score-player[_ngcontent-%COMP%] {\n    grid-template-columns: minmax(0, 1fr);\n  }\n}\n/*# sourceMappingURL=match-context-hud.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatchContextHud, [{
    type: Component,
    args: [{ selector: "app-match-context-hud", imports: [], template: `<header
  class="context-header"
  [attr.data-testid]="contextHeaderTestIdSignal()"
  [attr.aria-hidden]="handoffActiveSignal() ? 'true' : null"
  [attr.inert]="handoffActiveSignal() ? '' : null"
>
  <p data-testid="active-player-indicator">Active player: {{ activePlayerNameSignal() }}</p>

  <p data-testid="current-round-indicator">Round: {{ currentRoundNumberSignal() }}</p>

  <div class="scoreboard" data-testid="scoreboard-indicator" aria-label="Match scores">
    @for (entry of scoreEntriesSignal(); track entry.id; let scoreIndex = $index) {
      <p class="score-item" [attr.data-testid]="'score-item-' + scoreIndex">
        <span class="score-label">{{ entry.name }}</span>
        <span class="score-value">{{ entry.score }}</span>
      </p>
    }

    @if (scoreEntriesSignal().length === 0) {
      <p class="score-empty">Scores pending</p>
    }
  </div>

  <p data-testid="turn-phase-indicator">Turn phase: {{ turnPhaseSignal() }}</p>

  @if (escobaOutcomeSignal(); as escobaOutcome) {
    <p data-testid="escoba-outcome-indicator" class="escoba-outcome-indicator">
      Escoba: {{ escobaOutcome.playerName }} ({{ escobaOutcome.escobaCount }})
    </p>
  }

  @if (roundResultSignal(); as roundResult) {
    <p data-testid="round-outcome-indicator" class="round-outcome-indicator">
      Round {{ roundResult.roundNumber }} resolved. Top score: {{ roundTopScoreSignal() }}
    </p>
  }

  @if (roundScoreBreakdownSignal().length > 0) {
    <section data-testid="round-score-breakdown" class="round-score-breakdown">
      <h3 class="round-score-breakdown-title">Desglose de puntuaci\xF3n de la ronda</h3>
      @for (
        entry of roundScoreBreakdownSignal();
        track entry.playerName;
        let playerIndex = $index
      ) {
        <div class="round-score-player" [attr.data-testid]="'round-score-player-' + playerIndex">
          <p class="round-score-player-name">{{ entry.playerName }}</p>
          <p>Escobas: {{ entry.escobas }}</p>
          <p>M\xE1s cartas: {{ entry.mostCards }}</p>
          <p>M\xE1s oros: {{ entry.mostOros }}</p>
          <p>M\xE1s sietes: {{ entry.mostSevens }}</p>
          <p>Siete de Oros: {{ entry.sieteDiVelo }}</p>
          <p>Total: {{ entry.total }}</p>
        </div>
      }
    </section>
  }

  @if (showViewWinnerSignal()) {
    <button
      type="button"
      data-testid="view-winner-button"
      class="round-action-button"
      aria-label="Ver ganador"
      (click)="onViewWinnerClick()"
      (keydown.enter)="onViewWinnerEnter($event)"
    >
      Ver ganador
    </button>
  } @else if (showStartNextRoundSignal()) {
    <button
      type="button"
      data-testid="start-next-round-button"
      class="round-action-button"
      aria-label="Empezar siguiente ronda"
      (click)="onStartNextRoundClick()"
      (keydown.enter)="onStartNextRoundEnter($event)"
    >
      Empezar siguiente ronda
    </button>
  }

  @if (matchWinnerSignal(); as matchWinner) {
    <p data-testid="match-winner-indicator" class="match-winner-indicator">
      Match winner: {{ matchWinner.map((winner) => winner.name).join(', ') }}
    </p>
  }
</header>
`, styles: ["/* src/app/features/game-board/game-table-page/components/match-context-hud/match-context-hud.scss */\n:host {\n  display: block;\n}\n.context-header {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);\n  align-items: center;\n  gap: 1rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 0.75rem;\n  border: 1px solid rgba(241, 226, 189, 0.24);\n  background: rgba(4, 11, 9, 0.72);\n  -webkit-backdrop-filter: blur(2px);\n  backdrop-filter: blur(2px);\n}\n.scoreboard {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.score-item {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.375rem;\n  margin: 0;\n  padding: 0.25rem 0.5rem;\n  border-radius: 999px;\n  background: rgba(241, 226, 189, 0.2);\n}\n.score-label {\n  font-weight: 600;\n}\n.score-value {\n  font-weight: 700;\n}\n.score-empty {\n  margin: 0;\n}\n.escoba-outcome-indicator,\n.round-outcome-indicator,\n.match-winner-indicator {\n  margin: 0;\n  grid-column: 1/-1;\n  padding: 0.375rem 0.5rem;\n  border-radius: 0.5rem;\n  background: rgba(241, 226, 189, 0.16);\n  font-weight: 600;\n}\n.round-score-breakdown {\n  grid-column: 1/-1;\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0.625rem;\n  border-radius: 0.625rem;\n  background: rgba(241, 226, 189, 0.16);\n}\n.round-score-breakdown-title {\n  margin: 0;\n  font-size: 0.95rem;\n}\n.round-score-player {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(8.25rem, 1fr));\n  gap: 0.25rem 0.75rem;\n  padding: 0.5rem;\n  border-radius: 0.5rem;\n  background: rgba(4, 11, 9, 0.36);\n}\n.round-score-player p {\n  margin: 0;\n}\n.round-score-player-name {\n  font-weight: 700;\n}\n.round-action-button {\n  grid-column: 1/-1;\n  justify-self: start;\n}\n@media (max-width: 700px) {\n  .context-header {\n    grid-template-columns: minmax(0, 1fr);\n    justify-items: start;\n    gap: 0.625rem;\n  }\n  .scoreboard {\n    justify-content: flex-start;\n  }\n  .round-score-player {\n    grid-template-columns: minmax(0, 1fr);\n  }\n}\n/*# sourceMappingURL=match-context-hud.css.map */\n"] }]
  }], null, { startNextRound: [{ type: Output, args: ["startNextRound"] }], viewWinner: [{ type: Output, args: ["viewWinner"] }], activePlayerName: [{
    type: Input
  }], currentRoundNumber: [{
    type: Input
  }], scoreEntries: [{
    type: Input
  }], turnPhase: [{
    type: Input
  }], escobaOutcome: [{
    type: Input
  }], roundResult: [{
    type: Input
  }], matchWinner: [{
    type: Input
  }], showStartNextRound: [{
    type: Input
  }], showViewWinner: [{
    type: Input
  }], roundScoreBreakdown: [{
    type: Input
  }], handoffActive: [{
    type: Input
  }], contextHeaderTestId: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MatchContextHud, { className: "MatchContextHud", filePath: "src/app/features/game-board/game-table-page/components/match-context-hud/match-context-hud.ts", lineNumber: 33 });
})();

// src/app/features/game-board/game-table-page/components/match-over-overlay/match-over-overlay.ts
var _forTrack03 = ($index, $item) => $item.playerName;
function MatchOverOverlay_For_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "p", 5);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const winnerName_r1 = ctx.$implicit;
    const \u0275$index_13_r2 = ctx.$index;
    \u0275\u0275attribute("data-testid", "winner-name-" + \u0275$index_13_r2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", winnerName_r1, " ");
  }
}
function MatchOverOverlay_For_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "li", 7)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const entry_r3 = ctx.$implicit;
    const \u0275$index_22_r4 = ctx.$index;
    \u0275\u0275attribute("data-testid", "match-score-row-" + \u0275$index_22_r4);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r3.playerName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r3.score);
  }
}
var MatchOverOverlay = class _MatchOverOverlay {
  winnerNamesState = signal([], ...ngDevMode ? [{ debugName: "winnerNamesState" }] : (
    /* istanbul ignore next */
    []
  ));
  matchScoreEntriesState = signal([], ...ngDevMode ? [{ debugName: "matchScoreEntriesState" }] : (
    /* istanbul ignore next */
    []
  ));
  winnerNamesSignal = this.winnerNamesState.asReadonly();
  matchScoreEntriesSignal = this.matchScoreEntriesState.asReadonly();
  returnToLobby = output();
  playAgain = output();
  set winnerNames(value) {
    this.winnerNamesState.set(value ?? []);
  }
  get winnerNames() {
    return this.winnerNamesState();
  }
  set matchScoreEntries(value) {
    this.matchScoreEntriesState.set(value ?? []);
  }
  get matchScoreEntries() {
    return this.matchScoreEntriesState();
  }
  onReturnToLobbyClick() {
    this.returnToLobby.emit();
  }
  onPlayAgainClick() {
    this.playAgain.emit();
  }
  static \u0275fac = function MatchOverOverlay_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatchOverOverlay)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MatchOverOverlay, selectors: [["app-match-over-overlay"]], inputs: { winnerNames: "winnerNames", matchScoreEntries: "matchScoreEntries" }, outputs: { returnToLobby: "returnToLobby", playAgain: "playAgain" }, decls: 19, vars: 0, consts: [["data-testid", "match-over-overlay", "role", "dialog", "aria-modal", "true", "aria-labelledby", "match-over-title", 1, "match-over-overlay"], [1, "match-over-overlay__content"], ["id", "match-over-title", "data-testid", "match-over-title", 1, "match-over-overlay__title"], [1, "match-over-overlay__subtitle"], [1, "match-over-overlay__winners"], [1, "match-over-overlay__winner-name"], [1, "match-over-overlay__scores"], [1, "match-over-overlay__score-row"], [1, "match-over-overlay__actions"], ["type", "button", "data-testid", "return-to-lobby-button", "aria-label", "Volver al lobby", 3, "click"], ["type", "button", "data-testid", "play-again-button", "aria-label", "Jugar de nuevo", 3, "click"]], template: function MatchOverOverlay_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "section", 0)(1, "div", 1)(2, "h2", 2);
      \u0275\u0275text(3, " Partida terminada ");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(4, "p", 3);
      \u0275\u0275text(5, "Ganador(es)");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(6, "div", 4);
      \u0275\u0275repeaterCreate(7, MatchOverOverlay_For_8_Template, 2, 2, "p", 5, \u0275\u0275repeaterTrackByIndex);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(9, "p", 3);
      \u0275\u0275text(10, "Puntuacion acumulada");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(11, "ul", 6);
      \u0275\u0275repeaterCreate(12, MatchOverOverlay_For_13_Template, 5, 3, "li", 7, _forTrack03);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(14, "div", 8)(15, "button", 9);
      \u0275\u0275domListener("click", function MatchOverOverlay_Template_button_click_15_listener() {
        return ctx.onReturnToLobbyClick();
      });
      \u0275\u0275text(16, " Volver al lobby ");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(17, "button", 10);
      \u0275\u0275domListener("click", function MatchOverOverlay_Template_button_click_17_listener() {
        return ctx.onPlayAgainClick();
      });
      \u0275\u0275text(18, " Jugar de nuevo ");
      \u0275\u0275domElementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(7);
      \u0275\u0275repeater(ctx.winnerNamesSignal());
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.matchScoreEntriesSignal());
    }
  }, styles: ["\n.match-over-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 5;\n  display: grid;\n  place-items: center;\n  padding: 1.5rem;\n  background: rgba(2, 8, 6, 0.96);\n  color: #f7f3e8;\n}\n.match-over-overlay__content[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.875rem;\n  inline-size: min(100%, 36rem);\n}\n.match-over-overlay__title[_ngcontent-%COMP%], \n.match-over-overlay__subtitle[_ngcontent-%COMP%], \n.match-over-overlay__winner-name[_ngcontent-%COMP%] {\n  margin: 0;\n  text-align: center;\n}\n.match-over-overlay__title[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  line-height: 1.2;\n}\n.match-over-overlay__subtitle[_ngcontent-%COMP%] {\n  font-weight: 700;\n}\n.match-over-overlay__winners[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.375rem;\n}\n.match-over-overlay__winner-name[_ngcontent-%COMP%] {\n  font-size: 1.125rem;\n  font-weight: 700;\n}\n.match-over-overlay__scores[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: grid;\n  gap: 0.375rem;\n}\n.match-over-overlay__score-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  padding: 0.375rem 0.625rem;\n  border: 1px solid rgba(247, 243, 232, 0.35);\n  border-radius: 0.5rem;\n}\n.match-over-overlay__actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n}\n.match-over-overlay__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  font-weight: 600;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n@media (max-width: 480px) {\n  .match-over-overlay[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .match-over-overlay__actions[_ngcontent-%COMP%] {\n    display: grid;\n  }\n  .match-over-overlay__actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    inline-size: 100%;\n  }\n}\n/*# sourceMappingURL=match-over-overlay.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatchOverOverlay, [{
    type: Component,
    args: [{ selector: "app-match-over-overlay", imports: [], template: `<section
  class="match-over-overlay"
  data-testid="match-over-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="match-over-title"
>
  <div class="match-over-overlay__content">
    <h2 id="match-over-title" data-testid="match-over-title" class="match-over-overlay__title">
      Partida terminada
    </h2>

    <p class="match-over-overlay__subtitle">Ganador(es)</p>
    <div class="match-over-overlay__winners">
      @for (winnerName of winnerNamesSignal(); track $index; let index = $index) {
        <p class="match-over-overlay__winner-name" [attr.data-testid]="'winner-name-' + index">
          {{ winnerName }}
        </p>
      }
    </div>

    <p class="match-over-overlay__subtitle">Puntuacion acumulada</p>
    <ul class="match-over-overlay__scores">
      @for (entry of matchScoreEntriesSignal(); track entry.playerName; let index = $index) {
        <li class="match-over-overlay__score-row" [attr.data-testid]="'match-score-row-' + index">
          <span>{{ entry.playerName }}</span>
          <span>{{ entry.score }}</span>
        </li>
      }
    </ul>

    <div class="match-over-overlay__actions">
      <button
        type="button"
        data-testid="return-to-lobby-button"
        aria-label="Volver al lobby"
        (click)="onReturnToLobbyClick()"
      >
        Volver al lobby
      </button>
      <button
        type="button"
        data-testid="play-again-button"
        aria-label="Jugar de nuevo"
        (click)="onPlayAgainClick()"
      >
        Jugar de nuevo
      </button>
    </div>
  </div>
</section>
`, styles: ["/* src/app/features/game-board/game-table-page/components/match-over-overlay/match-over-overlay.scss */\n.match-over-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 5;\n  display: grid;\n  place-items: center;\n  padding: 1.5rem;\n  background: rgba(2, 8, 6, 0.96);\n  color: #f7f3e8;\n}\n.match-over-overlay__content {\n  display: grid;\n  gap: 0.875rem;\n  inline-size: min(100%, 36rem);\n}\n.match-over-overlay__title,\n.match-over-overlay__subtitle,\n.match-over-overlay__winner-name {\n  margin: 0;\n  text-align: center;\n}\n.match-over-overlay__title {\n  font-size: 1.5rem;\n  line-height: 1.2;\n}\n.match-over-overlay__subtitle {\n  font-weight: 700;\n}\n.match-over-overlay__winners {\n  display: grid;\n  gap: 0.375rem;\n}\n.match-over-overlay__winner-name {\n  font-size: 1.125rem;\n  font-weight: 700;\n}\n.match-over-overlay__scores {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: grid;\n  gap: 0.375rem;\n}\n.match-over-overlay__score-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  padding: 0.375rem 0.625rem;\n  border: 1px solid rgba(247, 243, 232, 0.35);\n  border-radius: 0.5rem;\n}\n.match-over-overlay__actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n}\n.match-over-overlay__actions button {\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  min-inline-size: 2.75rem;\n  min-block-size: 2.75rem;\n  font-weight: 600;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n@media (max-width: 480px) {\n  .match-over-overlay {\n    padding: 1rem;\n  }\n  .match-over-overlay__actions {\n    display: grid;\n  }\n  .match-over-overlay__actions button {\n    inline-size: 100%;\n  }\n}\n/*# sourceMappingURL=match-over-overlay.css.map */\n"] }]
  }], null, { returnToLobby: [{ type: Output, args: ["returnToLobby"] }], playAgain: [{ type: Output, args: ["playAgain"] }], winnerNames: [{
    type: Input
  }], matchScoreEntries: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MatchOverOverlay, { className: "MatchOverOverlay", filePath: "src/app/features/game-board/game-table-page/components/match-over-overlay/match-over-overlay.ts", lineNumber: 14 });
})();

// src/app/features/game-board/game-table-page/game-table-page.ts
function GameTablePage_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-match-over-overlay", 15);
    \u0275\u0275listener("returnToLobby", function GameTablePage_Conditional_13_Template_app_match_over_overlay_returnToLobby_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onReturnToLobby());
    })("playAgain", function GameTablePage_Conditional_13_Template_app_match_over_overlay_playAgain_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onPlayAgain());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("winnerNames", ctx_r1.winnerNames())("matchScoreEntries", ctx_r1.matchScoreEntries());
  }
}
function GameTablePage_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-turn-handoff-overlay", 16);
    \u0275\u0275listener("handoffAcknowledged", function GameTablePage_Conditional_14_Template_app_turn_handoff_overlay_handoffAcknowledged_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onHandoffAcknowledged());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("nextPlayerName", ctx_r1.activePlayerName());
  }
}
function GameTablePage_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Next turn: ", ctx_r1.activePlayerName());
  }
}
var GameTablePage = class _GameTablePage {
  static ANIMATION_COMPLETION_TIMEOUT_MS = 1500;
  static PLAY_ANIMATION_DURATION_MS = 1e3;
  static CAPTURE_ANIMATION_DURATION_MS = 900;
  static ESCOBA_ANIMATION_DURATION_MS = 700;
  static DEAL_ANIMATION_DURATION_MS = 1e3;
  static OPPONENT_PLAY_ANIMATION_DURATION_MS = 1e3;
  injector = inject(Injector);
  ngZone = inject(NgZone);
  changeDetectorRef = inject(ChangeDetectorRef);
  gameEngine = inject(GameEngine);
  gameSession = inject(GameSession);
  aiStrategyService = inject(AiStrategyService);
  router = inject(Router);
  componentInteractionState = inject(TableInteractionState);
  parentInteractionState = inject(TableInteractionState, {
    skipSelf: true,
    optional: true
  });
  interactionState = this.resolveInteractionState();
  turnPausePolicy = inject(TurnPausePolicy);
  cardAnimationOrchestrator = inject(CardAnimationOrchestrator);
  showTurnHandoffOverlayState = signal(false, ...ngDevMode ? [{ debugName: "showTurnHandoffOverlayState" }] : (
    /* istanbul ignore next */
    []
  ));
  showMatchOverOverlayState = signal(false, ...ngDevMode ? [{ debugName: "showMatchOverOverlayState" }] : (
    /* istanbul ignore next */
    []
  ));
  isAiTurnInProgress = signal(false, ...ngDevMode ? [{ debugName: "isAiTurnInProgress" }] : (
    /* istanbul ignore next */
    []
  ));
  aiTurnAnimationState = signal(AI_TURN_IDLE, ...ngDevMode ? [{ debugName: "aiTurnAnimationState" }] : (
    /* istanbul ignore next */
    []
  ));
  liveAnnouncementState = signal("", ...ngDevMode ? [{ debugName: "liveAnnouncementState" }] : (
    /* istanbul ignore next */
    []
  ));
  transientPlayedHandCardState = signal(null, ...ngDevMode ? [{ debugName: "transientPlayedHandCardState" }] : (
    /* istanbul ignore next */
    []
  ));
  transientCapturedTableCardsState = signal([], ...ngDevMode ? [{ debugName: "transientCapturedTableCardsState" }] : (
    /* istanbul ignore next */
    []
  ));
  lastAnnouncedRoundNumber = null;
  constructor() {
    this.bootstrapEngineStateFromSession();
    effect(() => {
      const roundResult = this.roundResult();
      if (roundResult === null) {
        this.lastAnnouncedRoundNumber = null;
        return;
      }
      if (this.lastAnnouncedRoundNumber === roundResult.roundNumber) {
        return;
      }
      this.lastAnnouncedRoundNumber = roundResult.roundNumber;
      this.announce(`Ronda ${roundResult.roundNumber} completada.`);
    });
    effect(() => {
      const configuration = this.gameSession.configuration();
      const activePlayer = this.gameEngine.activePlayer();
      const aiPlayerId = this.aiPlayerId();
      const turnPhase = this.gameEngine.turnPhase();
      if (configuration?.mode !== "Single Player") {
        return;
      }
      if (activePlayer === null || aiPlayerId === null) {
        return;
      }
      if (turnPhase !== "awaiting-card-play" || this.isAiTurnInProgress()) {
        return;
      }
      if (activePlayer.id !== aiPlayerId) {
        return;
      }
      void this.runAiTurn().catch(() => void 0);
    });
  }
  turnPhase = this.gameEngine.turnPhase;
  animationState = this.cardAnimationOrchestrator.animationState;
  validationMessage = signal("", ...ngDevMode ? [{ debugName: "validationMessage" }] : (
    /* istanbul ignore next */
    []
  ));
  liveAnnouncement = this.liveAnnouncementState.asReadonly();
  selectedHandCard = this.interactionState.selectedHandCard;
  selectedTableCards = computed(() => {
    const aiAnimationState = this.aiTurnAnimationState();
    if (aiAnimationState.phase === "capture-previewing") {
      return aiAnimationState.highlightedTableCards;
    }
    return this.interactionState.selectedTableCards();
  }, ...ngDevMode ? [{ debugName: "selectedTableCards" }] : (
    /* istanbul ignore next */
    []
  ));
  isCaptureSelectionValid = this.interactionState.isCaptureSelectionValid;
  handoffEnabled = computed(() => {
    if (typeof this.interactionState.handoffEnabled !== "function") {
      return false;
    }
    return this.interactionState.handoffEnabled();
  }, ...ngDevMode ? [{ debugName: "handoffEnabled" }] : (
    /* istanbul ignore next */
    []
  ));
  isMultiplayer = computed(() => {
    return this.gameSession.configuration()?.mode === "Multiplayer";
  }, ...ngDevMode ? [{ debugName: "isMultiplayer" }] : (
    /* istanbul ignore next */
    []
  ));
  showTurnHandoffOverlay = computed(() => {
    return this.showTurnHandoffOverlayState() && this.isMultiplayer() && this.handoffEnabled();
  }, ...ngDevMode ? [{ debugName: "showTurnHandoffOverlay" }] : (
    /* istanbul ignore next */
    []
  ));
  contextHeaderTestId = computed(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return "Cypress" in window ? "context-header" : null;
  }, ...ngDevMode ? [{ debugName: "contextHeaderTestId" }] : (
    /* istanbul ignore next */
    []
  ));
  canSubmitPlay = computed(() => {
    if (this.interactionState.selectedHandCard() === null) {
      return true;
    }
    return this.interactionState.canSubmitPlay();
  }, ...ngDevMode ? [{ debugName: "canSubmitPlay" }] : (
    /* istanbul ignore next */
    []
  ));
  interactionEnabled = computed(() => {
    const configuration = this.gameSession.configuration();
    const activePlayer = this.gameEngine.activePlayer();
    return this.gameEngine.turnPhase() === "awaiting-card-play" && !this.showTurnHandoffOverlay() && !this.isAiTurnInProgress() && !(configuration?.mode === "Single Player" && activePlayer?.id === this.aiPlayerId());
  }, ...ngDevMode ? [{ debugName: "interactionEnabled" }] : (
    /* istanbul ignore next */
    []
  ));
  preserveCardFocusOrderWhenBlocked = computed(() => {
    return this.animationState().groups.some((group) => group.status === "running");
  }, ...ngDevMode ? [{ debugName: "preserveCardFocusOrderWhenBlocked" }] : (
    /* istanbul ignore next */
    []
  ));
  aiPlayerId = computed(() => {
    return this.gameEngine.state()?.players[1]?.id ?? null;
  }, ...ngDevMode ? [{ debugName: "aiPlayerId" }] : (
    /* istanbul ignore next */
    []
  ));
  aiHandCardCount = computed(() => {
    if (this.gameSession.configuration()?.mode !== "Single Player") {
      return 0;
    }
    const aiPlayerId = this.aiPlayerId();
    if (aiPlayerId === null) {
      return 0;
    }
    const state = this.gameEngine.state();
    if (state === null) {
      return 0;
    }
    const aiPlayer = state.players.find((player) => player.id === aiPlayerId);
    return aiPlayer?.hand.length ?? 0;
  }, ...ngDevMode ? [{ debugName: "aiHandCardCount" }] : (
    /* istanbul ignore next */
    []
  ));
  aiHighlightedTableCards = computed(() => {
    return this.aiTurnAnimationState().highlightedTableCards;
  }, ...ngDevMode ? [{ debugName: "aiHighlightedTableCards" }] : (
    /* istanbul ignore next */
    []
  ));
  suppressAiCardAnimations = computed(() => {
    const configuration = this.gameSession.configuration();
    const activePlayer = this.gameEngine.activePlayer();
    const aiPlayerId = this.aiPlayerId();
    return configuration?.mode === "Single Player" && this.gameEngine.turnPhase() === "awaiting-card-play" && !this.isAiTurnInProgress() && activePlayer !== null && aiPlayerId !== null && activePlayer.id !== aiPlayerId;
  }, ...ngDevMode ? [{ debugName: "suppressAiCardAnimations" }] : (
    /* istanbul ignore next */
    []
  ));
  submitActionLocked = computed(() => {
    return this.isAiTurnInProgress();
  }, ...ngDevMode ? [{ debugName: "submitActionLocked" }] : (
    /* istanbul ignore next */
    []
  ));
  activePlayerName = computed(() => {
    return this.gameEngine.activePlayer()?.name ?? "No active player";
  }, ...ngDevMode ? [{ debugName: "activePlayerName" }] : (
    /* istanbul ignore next */
    []
  ));
  currentRoundNumber = computed(() => {
    return this.gameEngine.state()?.roundNumber ?? 0;
  }, ...ngDevMode ? [{ debugName: "currentRoundNumber" }] : (
    /* istanbul ignore next */
    []
  ));
  activeHandCards = computed(() => {
    const transientPlayedCard = this.transientPlayedHandCardState();
    if (this.gameSession.configuration()?.mode === "Single Player") {
      const activeHand2 = this.gameEngine.state()?.players[0]?.hand ?? [];
      return this.withTransientCard(activeHand2, transientPlayedCard);
    }
    const activeHand = this.gameEngine.activePlayer()?.hand ?? [];
    return this.withTransientCard(activeHand, transientPlayedCard);
  }, ...ngDevMode ? [{ debugName: "activeHandCards" }] : (
    /* istanbul ignore next */
    []
  ));
  tableCards = computed(() => {
    const transientPlayedCard = this.transientPlayedHandCardState();
    const stateTableCards = this.gameEngine.state()?.table ?? [];
    const visibleTableCards = transientPlayedCard === null ? stateTableCards : stateTableCards.filter((card) => !this.areCardsEqual(card, transientPlayedCard));
    return this.withTransientCards(visibleTableCards, this.transientCapturedTableCardsState());
  }, ...ngDevMode ? [{ debugName: "tableCards" }] : (
    /* istanbul ignore next */
    []
  ));
  activeHandAnimationMetadata = computed(() => {
    const animationState = this.activeAnimationVisualState();
    return {
      hand: this.activeHandCards().map((card) => ({
        card,
        animationState: this.resolveCardAnimationState(animationState, card)
      }))
    };
  }, ...ngDevMode ? [{ debugName: "activeHandAnimationMetadata" }] : (
    /* istanbul ignore next */
    []
  ));
  centerTableAnimationMetadata = computed(() => {
    const animationState = this.activeAnimationVisualState();
    return {
      table: this.tableCards().map((card) => ({
        card,
        animationState: this.resolveCardAnimationState(animationState, card)
      }))
    };
  }, ...ngDevMode ? [{ debugName: "centerTableAnimationMetadata" }] : (
    /* istanbul ignore next */
    []
  ));
  opponentAnimationMetadata = computed(() => {
    const animationState = this.activeAnimationVisualState();
    const aiAnimationState = this.aiTurnAnimationState();
    const aiFallbackCardIndex = aiAnimationState.selectedCardIndex ?? 0;
    const inSinglePlayerMode = this.gameSession.configuration()?.mode === "Single Player";
    const activePlayer = this.gameEngine.activePlayer();
    const aiPlayerId = this.aiPlayerId();
    const isHumanTurnActive = this.gameEngine.turnPhase() === "awaiting-card-play";
    const isHumanCaptureConfirmationPhase = this.gameEngine.turnPhase() === "awaiting-confirmation";
    const isHumanCaptureVisualState = animationState === "capture" || animationState === "escoba";
    const isHumanPlayerTurn = activePlayer !== null && aiPlayerId !== null && activePlayer.id !== aiPlayerId;
    const shouldEnforceHumanCaptureIsolation = inSinglePlayerMode && isHumanCaptureVisualState && (isHumanTurnActive && isHumanPlayerTurn || isHumanCaptureConfirmationPhase);
    const shouldSuppressOpponentMetadata = inSinglePlayerMode && this.suppressAiCardAnimations() && isHumanTurnActive;
    if (shouldEnforceHumanCaptureIsolation) {
      return {
        opponent: []
      };
    }
    if (shouldSuppressOpponentMetadata) {
      return {
        opponent: []
      };
    }
    if (animationState === null && inSinglePlayerMode && aiAnimationState.phase !== "idle" && this.aiHandCardCount() > 0) {
      return {
        opponent: [
          {
            cardIndex: aiFallbackCardIndex,
            animationState: "opponent"
          }
        ]
      };
    }
    return {
      opponent: this.activeAnimationCardIds().map((_, index) => ({
        cardIndex: index,
        animationState
      }))
    };
  }, ...ngDevMode ? [{ debugName: "opponentAnimationMetadata" }] : (
    /* istanbul ignore next */
    []
  ));
  scoreEntries = computed(() => {
    const state = this.gameEngine.state();
    if (state) {
      return state.players.map((player) => ({
        id: player.id,
        name: player.name,
        score: state.matchScores[player.id] ?? 0
      }));
    }
    const configuration = this.gameSession.configuration();
    if (!configuration) {
      return [];
    }
    return configuration.playerNames.map((name, index) => ({
      id: `pending-score-${index + 1}`,
      name,
      score: 0
    }));
  }, ...ngDevMode ? [{ debugName: "scoreEntries" }] : (
    /* istanbul ignore next */
    []
  ));
  roundResult = computed(() => this.readEngineRoundResult(), ...ngDevMode ? [{ debugName: "roundResult" }] : (
    /* istanbul ignore next */
    []
  ));
  matchWinner = computed(() => this.readEngineMatchWinner(), ...ngDevMode ? [{ debugName: "matchWinner" }] : (
    /* istanbul ignore next */
    []
  ));
  showStartNextRoundButton = computed(() => {
    return this.roundResult() !== null && this.matchWinner() === null;
  }, ...ngDevMode ? [{ debugName: "showStartNextRoundButton" }] : (
    /* istanbul ignore next */
    []
  ));
  showViewWinnerButton = computed(() => {
    return this.roundResult() !== null && this.matchWinner() !== null;
  }, ...ngDevMode ? [{ debugName: "showViewWinnerButton" }] : (
    /* istanbul ignore next */
    []
  ));
  roundScoreBreakdown = computed(() => {
    const roundResult = this.roundResult();
    const state = this.gameEngine.state();
    if (roundResult === null || state === null) {
      return [];
    }
    const playerNamesById = new Map(state.players.map((player) => [player.id, player.name]));
    return roundResult.playerScores.map((scoreEntry) => ({
      playerName: playerNamesById.get(scoreEntry.playerId) ?? scoreEntry.playerId,
      escobas: scoreEntry.escobas,
      mostCards: scoreEntry.mostCards,
      mostOros: scoreEntry.mostOros,
      mostSevens: scoreEntry.mostSevens,
      sieteDiVelo: scoreEntry.sieteDiVelo,
      total: scoreEntry.total
    }));
  }, ...ngDevMode ? [{ debugName: "roundScoreBreakdown" }] : (
    /* istanbul ignore next */
    []
  ));
  winnerNames = computed(() => {
    const winners = this.matchWinner();
    if (winners === null) {
      return [];
    }
    return winners.map((winner) => winner.name);
  }, ...ngDevMode ? [{ debugName: "winnerNames" }] : (
    /* istanbul ignore next */
    []
  ));
  matchScoreEntries = computed(() => {
    const state = this.gameEngine.state();
    if (state === null) {
      return [];
    }
    return state.players.map((player) => ({
      playerName: player.name,
      score: state.matchScores[player.id] ?? 0
    }));
  }, ...ngDevMode ? [{ debugName: "matchScoreEntries" }] : (
    /* istanbul ignore next */
    []
  ));
  showMatchOverOverlay = this.showMatchOverOverlayState.asReadonly();
  escobaOutcome = computed(() => {
    const state = this.gameEngine.state();
    if (!state || state.table.length !== 0 || state.lastCapturerId === null) {
      return null;
    }
    const escobaPlayer = state.players.find((player) => player.id === state.lastCapturerId);
    if (!escobaPlayer || escobaPlayer.escobaCount <= 0) {
      return null;
    }
    return {
      playerName: escobaPlayer.name,
      escobaCount: escobaPlayer.escobaCount
    };
  }, ...ngDevMode ? [{ debugName: "escobaOutcome" }] : (
    /* istanbul ignore next */
    []
  ));
  opponents = computed(() => {
    const state = this.gameEngine.state();
    if (state) {
      if (this.gameSession.configuration()?.mode === "Single Player") {
        const aiPlayerId = this.aiPlayerId();
        if (aiPlayerId === null) {
          return [];
        }
        return state.players.filter((player) => player.id === aiPlayerId);
      }
      return state.players.filter((_, index) => index !== state.turnIndex);
    }
    const configuration = this.gameSession.configuration();
    if (!configuration) {
      return [];
    }
    return this.buildPlaceholderOpponents(configuration.playerCount - 1);
  }, ...ngDevMode ? [{ debugName: "opponents" }] : (
    /* istanbul ignore next */
    []
  ));
  hasSessionConfiguration = computed(() => {
    return this.gameSession.configuration() !== null;
  }, ...ngDevMode ? [{ debugName: "hasSessionConfiguration" }] : (
    /* istanbul ignore next */
    []
  ));
  submitPlay() {
    const selectedHandCard = this.interactionState.selectedHandCard();
    if (selectedHandCard === null) {
      const message = "Select a hand card before submitting play.";
      this.validationMessage.set(message);
      this.announce(message);
      this.focusByTestIdAfterRender("play-validation-message");
      return;
    }
    if (!this.interactionState.canSubmitPlay() || !this.interactionState.isCaptureSelectionValid()) {
      const message = "Selected capture subset is not valid.";
      this.validationMessage.set(message);
      this.announce(message);
      this.focusByTestIdAfterRender("play-validation-message");
      return;
    }
    if (this.gameEngine.turnPhase() !== "awaiting-card-play") {
      return;
    }
    this.validationMessage.set("");
    this.announce("");
    const selectedCaptureCards = this.interactionState.selectedTableCards();
    this.transientPlayedHandCardState.set(selectedHandCard);
    this.transientCapturedTableCardsState.set(selectedCaptureCards);
    const playedCardId = this.toCardId(selectedHandCard);
    const playGroupId = this.cardAnimationOrchestrator.startGroup({
      actionType: "play",
      cardIds: [playedCardId]
    });
    this.cardAnimationOrchestrator.completeParticipant(playGroupId, playedCardId, 100);
    this.scheduleAnimationGroupCompletion(playGroupId, this.resolveAnimationCompletionDelayMs(_GameTablePage.PLAY_ANIMATION_DURATION_MS), () => {
      this.transientPlayedHandCardState.set(null);
    });
    if (selectedCaptureCards.length > 0) {
      const capturedCardIds = selectedCaptureCards.map((card) => this.toCardId(card));
      const captureGroupId = this.cardAnimationOrchestrator.startGroup({
        actionType: "capture",
        cardIds: capturedCardIds
      });
      for (const capturedCardId of capturedCardIds) {
        this.cardAnimationOrchestrator.completeParticipant(captureGroupId, capturedCardId, 100);
      }
      this.scheduleAnimationGroupCompletion(captureGroupId, _GameTablePage.CAPTURE_ANIMATION_DURATION_MS, () => {
        this.transientCapturedTableCardsState.set([]);
      });
    } else {
      this.transientCapturedTableCardsState.set([]);
    }
    this.gameEngine.playCard(selectedHandCard, selectedCaptureCards);
    if (selectedCaptureCards.length > 0 && this.escobaOutcome() !== null) {
      const capturedCardIds = selectedCaptureCards.map((card) => this.toCardId(card));
      const escobaGroupId = this.cardAnimationOrchestrator.startGroup({
        actionType: "escoba",
        cardIds: capturedCardIds
      });
      for (const capturedCardId of capturedCardIds) {
        this.cardAnimationOrchestrator.completeParticipant(escobaGroupId, capturedCardId, 100);
      }
      this.scheduleAnimationGroupCompletion(escobaGroupId, this.resolveAnimationCompletionDelayMs(_GameTablePage.ESCOBA_ANIMATION_DURATION_MS), () => {
        this.transientCapturedTableCardsState.set([]);
      });
    }
    this.interactionState.resetForNextAction?.();
    this.focusByTestIdAfterRender("confirm-turn");
  }
  onHandCardSelected(card) {
    if (!this.interactionEnabled()) {
      return;
    }
    this.interactionState.selectHandCard(card);
    this.syncValidationMessage();
  }
  onTableCardToggled(card) {
    if (!this.interactionEnabled()) {
      return;
    }
    this.interactionState.toggleTableCard(card);
    this.syncValidationMessage();
  }
  async confirmTurn() {
    if (this.gameEngine.turnPhase() !== "awaiting-confirmation") {
      return;
    }
    this.focusByTestIdAfterRender("submit-play");
    await this.confirmTurnWithSequencing("player-post-play-confirm", false);
  }
  ngOnDestroy() {
    const runningGroupIds = this.animationState().groups.filter((group) => group.status === "running").map((group) => group.id);
    for (const groupId of runningGroupIds) {
      this.cardAnimationOrchestrator.cancelGroup(groupId);
    }
    this.resetTransientAnimationState();
  }
  async confirmTurnWithSequencing(stage, alwaysApplyPause) {
    const stateBeforeConfirm = this.gameEngine.state();
    const playersBeforeConfirm = stateBeforeConfirm?.players ?? [];
    const awaitedAnimationCompletion = await this.waitForActiveAnimationGroupCompletion();
    if (awaitedAnimationCompletion) {
      this.resetTransientAnimationState();
    }
    if (this.gameEngine.turnPhase() !== "awaiting-confirmation") {
      return;
    }
    if (awaitedAnimationCompletion || alwaysApplyPause) {
      const reducedMotion = this.prefersReducedMotion();
      const resolvedPauseMs = this.turnPausePolicy.resolvePauseMs(stage, { reducedMotion });
      await this.waitOutsideAngular(resolvedPauseMs);
      if (this.gameEngine.turnPhase() !== "awaiting-confirmation") {
        return;
      }
    }
    this.showTurnHandoffOverlayState.set(false);
    this.validationMessage.set("");
    this.gameEngine.confirmTurn();
    this.startDealAnimationForNewHandCards(playersBeforeConfirm);
    const nextPlayerName = this.gameEngine.activePlayer()?.name ?? "No active player";
    this.announce(`Turn changed to ${nextPlayerName}.`);
    if (this.isMultiplayer() && this.handoffEnabled()) {
      this.showTurnHandoffOverlayState.set(true);
      this.focusByTestIdAfterRender("handoff-acknowledge");
      return;
    }
    this.focusByTestIdAfterRender("submit-play");
  }
  async waitForActiveAnimationGroupCompletion() {
    const animationStateSnapshot = this.animationState();
    const runningGroupId = animationStateSnapshot.groups.find((group) => group.status === "running")?.id ?? null;
    const activeGroupId = animationStateSnapshot.activeGroupId ?? runningGroupId;
    if (activeGroupId === null) {
      return false;
    }
    const completionKnown = this.animationState().completedGroupIds.includes(activeGroupId) || this.cardAnimationOrchestrator.lastCompletedGroupId() === activeGroupId;
    if (completionKnown) {
      return true;
    }
    await new Promise((resolve) => {
      let settled = false;
      let completionWatcher = null;
      const settle = () => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(fallbackTimeoutId);
        completionWatcher?.destroy();
        resolve();
      };
      const fallbackTimeoutId = this.ngZone.runOutsideAngular(() => setTimeout(() => {
        settle();
      }, _GameTablePage.ANIMATION_COMPLETION_TIMEOUT_MS));
      completionWatcher = effect(() => {
        const state = this.animationState();
        const completed = state.completedGroupIds.includes(activeGroupId) || this.cardAnimationOrchestrator.lastCompletedGroupId() === activeGroupId;
        const noLongerActive = state.activeGroupId !== activeGroupId;
        if (completed || noLongerActive) {
          settle();
        }
      }, { injector: this.injector });
    });
    return true;
  }
  onHandoffToggleChanged(enabled) {
    if (typeof this.interactionState.setHandoffEnabled !== "function") {
      return;
    }
    this.interactionState.setHandoffEnabled(enabled);
  }
  onHandoffAcknowledged() {
    this.showTurnHandoffOverlayState.set(false);
    this.focusByTestIdAfterRender("submit-play");
  }
  onStartNextRound() {
    this.gameEngine.startNextRound();
  }
  onViewWinner() {
    const winners = this.winnerNames();
    if (winners.length === 0) {
      return;
    }
    this.showMatchOverOverlayState.set(true);
    const winnerLabel = winners.join(", ");
    const winnerNoun = winners.length > 1 ? "Ganadores" : "Ganador";
    this.announce(`Partida terminada. ${winnerNoun}: ${winnerLabel}.`);
    this.focusByTestIdAfterRender("return-to-lobby-button");
  }
  onPlayAgain() {
    const configuration = this.gameSession.configuration();
    if (configuration === null) {
      this.showMatchOverOverlayState.set(false);
      this.announce("No hay una configuracion activa. Volviendo al lobby.");
      void this.router.navigate(["/"]);
      return;
    }
    this.showMatchOverOverlayState.set(false);
    this.gameEngine.initGame(configuration);
    this.focusByTestIdAfterRender("submit-play");
  }
  onReturnToLobby() {
    this.showMatchOverOverlayState.set(false);
    void this.router.navigate(["/"]);
  }
  resolveInteractionState() {
    const parent = this.parentInteractionState;
    if (!parent) {
      return this.componentInteractionState;
    }
    if (parent instanceof TableInteractionState) {
      return this.componentInteractionState;
    }
    return parent;
  }
  bootstrapEngineStateFromSession() {
    const configuration = this.gameSession.configuration();
    if (configuration === null) {
      return;
    }
    if (this.gameEngine.state() !== null) {
      return;
    }
    this.gameEngine.initGame(configuration);
  }
  buildPlaceholderOpponents(opponentCount) {
    return Array.from({ length: Math.max(opponentCount, 0) }, (_, index) => ({
      id: `pending-opponent-${index + 1}`,
      name: `Opponent ${index + 1}`,
      hand: [],
      capturedPile: [],
      escobaCount: 0
    }));
  }
  syncValidationMessage() {
    const selectedHandCard = this.interactionState.selectedHandCard();
    if (selectedHandCard === null) {
      this.validationMessage.set("");
      return;
    }
    if (!this.interactionState.isCaptureSelectionValid()) {
      this.validationMessage.set("Selected capture subset is not valid.");
      return;
    }
    this.validationMessage.set("");
  }
  announce(message) {
    this.liveAnnouncementState.set(message);
    if (typeof document === "undefined") {
      return;
    }
    const liveRegionElement = document.querySelector('[data-testid="a11y-live-region"]');
    if (!liveRegionElement) {
      return;
    }
    liveRegionElement.textContent = message;
  }
  readEngineRoundResult() {
    const engine = this.gameEngine;
    if (typeof engine.roundResult !== "function") {
      return null;
    }
    return engine.roundResult();
  }
  readEngineMatchWinner() {
    const engine = this.gameEngine;
    if (typeof engine.matchWinner !== "function") {
      return null;
    }
    return engine.matchWinner();
  }
  focusByTestIdAfterRender(testId) {
    if (typeof document === "undefined") {
      return;
    }
    this.changeDetectorRef.detectChanges();
    const target = document.querySelector(`[data-testid="${testId}"]`);
    target?.focus();
  }
  activeAnimationCardIds() {
    const runningGroups = this.animationState().groups.filter((group) => group.status === "running");
    return runningGroups.flatMap((group) => group.participantCards.map((participant) => participant.cardId));
  }
  activeAnimationVisualState() {
    const activeGroup = this.resolveActiveAnimationGroup(this.animationState());
    if (activeGroup === null) {
      return null;
    }
    return this.mapActionTypeToVisualState(activeGroup.actionType);
  }
  resolveCardAnimationState(animationState, card) {
    if (animationState === null) {
      return null;
    }
    return this.resolveVisualStateForCard(card);
  }
  resolveVisualStateForCard(card) {
    const cardId = this.toCardId(card);
    const runningGroups = this.animationState().groups;
    for (let groupIndex = runningGroups.length - 1; groupIndex >= 0; groupIndex -= 1) {
      const group = runningGroups[groupIndex];
      if (group.status !== "running") {
        continue;
      }
      const containsCard = group.participantCards.some((participant) => participant.cardId === cardId);
      if (!containsCard) {
        continue;
      }
      return this.mapActionTypeToVisualState(group.actionType);
    }
    return null;
  }
  resolveActiveAnimationGroup(state) {
    if (state.activeGroupId === null) {
      return null;
    }
    return state.groups.find((group) => group.id === state.activeGroupId && group.status === "running") ?? null;
  }
  mapActionTypeToVisualState(actionType) {
    if (this.prefersReducedMotion()) {
      return null;
    }
    switch (actionType) {
      case "play":
        return "play";
      case "capture":
        return "capture";
      case "deal":
        return "deal";
      case "escoba":
        return "escoba";
      case "opponent-play":
        return "opponent";
      default:
        return null;
    }
  }
  toCardId(card) {
    return `${card.suit}-${card.rank}`;
  }
  scheduleAnimationGroupCompletion(groupId, delayMs, onCompleted) {
    if (delayMs <= 0) {
      this.cardAnimationOrchestrator.finalizeGroup(groupId);
      onCompleted?.();
      return;
    }
    setTimeout(() => {
      this.cardAnimationOrchestrator.finalizeGroup(groupId);
      onCompleted?.();
    }, delayMs);
  }
  waitOutsideAngular(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
  resolveAnimationCompletionDelayMs(maxDurationMs) {
    const reducedMotion = this.prefersReducedMotion();
    if (reducedMotion) {
      return 0;
    }
    const policyDelay = this.turnPausePolicy.resolvePauseMs("player-post-play-confirm", {
      reducedMotion
    });
    return Math.max(1, Math.min(maxDurationMs, policyDelay));
  }
  withTransientCard(cards, transientCard) {
    if (transientCard === null || this.includesCard(cards, transientCard)) {
      return cards;
    }
    return [...cards, transientCard];
  }
  resetTransientAnimationState() {
    this.transientPlayedHandCardState.set(null);
    this.transientCapturedTableCardsState.set([]);
  }
  withTransientCards(cards, transientCards) {
    if (transientCards.length === 0) {
      return cards;
    }
    const missingCards = transientCards.filter((card) => !this.includesCard(cards, card));
    if (missingCards.length === 0) {
      return cards;
    }
    return [...cards, ...missingCards];
  }
  includesCard(cards, targetCard) {
    return cards.some((card) => this.areCardsEqual(card, targetCard));
  }
  resolveAiPhasePauseMs(stage, reducedMotion) {
    if (reducedMotion) {
      return 0;
    }
    const resolvedPauseMs = this.turnPausePolicy.resolvePauseMs(stage, { reducedMotion });
    if (!this.turnPausePolicy.hasRuntimeOverride()) {
      return resolvedPauseMs;
    }
    return Math.min(resolvedPauseMs, 10);
  }
  startDealAnimationForNewHandCards(playersBeforeConfirm) {
    const stateAfterConfirm = this.gameEngine.state();
    if (stateAfterConfirm === null) {
      return;
    }
    const recipients = stateAfterConfirm.players.map((player) => ({
      playerId: player.id,
      handAfterConfirm: player.hand,
      handBeforeConfirm: playersBeforeConfirm.find((beforePlayer) => beforePlayer.id === player.id)?.hand ?? []
    })).map(({ playerId, handAfterConfirm, handBeforeConfirm: previousHand }) => ({
      playerId,
      newlyDealtCards: handAfterConfirm.filter((afterCard) => !previousHand.some((beforeCard) => this.areCardsEqual(beforeCard, afterCard)))
    })).filter((recipient) => recipient.newlyDealtCards.length > 0);
    if (recipients.length === 0) {
      return;
    }
    const dealCardIds = recipients.flatMap((recipient) => recipient.newlyDealtCards.map((card) => this.toCardId(card)));
    const dealGroupId = this.cardAnimationOrchestrator.startGroup({
      actionType: "deal",
      cardIds: dealCardIds
    });
    for (const dealCardId of dealCardIds) {
      this.cardAnimationOrchestrator.completeParticipant(dealGroupId, dealCardId, 100);
    }
    this.scheduleAnimationGroupCompletion(dealGroupId, this.resolveAnimationCompletionDelayMs(_GameTablePage.DEAL_ANIMATION_DURATION_MS));
  }
  async runAiTurn() {
    const configuration = this.gameSession.configuration();
    const aiPlayerId = this.aiPlayerId();
    const state = this.gameEngine.state();
    const activePlayer = this.gameEngine.activePlayer();
    if (configuration?.mode !== "Single Player" || aiPlayerId === null || state === null || activePlayer === null || activePlayer.id !== aiPlayerId || this.gameEngine.turnPhase() !== "awaiting-card-play" || this.isAiTurnInProgress()) {
      return;
    }
    const reducedMotion = this.prefersReducedMotion();
    const aiPlayer = state.players.find((player) => player.id === aiPlayerId);
    if (!aiPlayer || aiPlayer.hand.length === 0) {
      return;
    }
    const difficulty = configuration.aiDifficulty;
    const aiEscobaCountBeforePlay = aiPlayer.escobaCount;
    this.isAiTurnInProgress.set(true);
    this.aiTurnAnimationState.set(__spreadProps(__spreadValues({}, AI_TURN_IDLE), {
      phase: "deliberating"
    }));
    try {
      await this.waitOutsideAngular(this.resolveAiPhasePauseMs("ai-deliberation", reducedMotion));
      const decision = this.aiStrategyService.decide(state, aiPlayer, difficulty);
      const selectedCardIndex = aiPlayer.hand.findIndex((card) => this.areCardsEqual(card, decision.cardToPlay));
      this.aiTurnAnimationState.set({
        phase: "card-selected",
        selectedCardIndex: selectedCardIndex >= 0 ? selectedCardIndex : null,
        revealedCard: null,
        highlightedTableCards: []
      });
      await this.waitOutsideAngular(this.resolveAiPhasePauseMs("ai-selection-preview", reducedMotion));
      if (decision.captureSubset.length > 0) {
        this.aiTurnAnimationState.set({
          phase: "capture-previewing",
          selectedCardIndex: selectedCardIndex >= 0 ? selectedCardIndex : null,
          revealedCard: decision.cardToPlay,
          highlightedTableCards: decision.captureSubset
        });
        await this.waitOutsideAngular(this.resolveAiPhasePauseMs("ai-capture-preview", reducedMotion));
      }
      this.aiTurnAnimationState.set({
        phase: "resolving",
        selectedCardIndex: selectedCardIndex >= 0 ? selectedCardIndex : null,
        revealedCard: decision.captureSubset.length > 0 ? decision.cardToPlay : null,
        highlightedTableCards: decision.captureSubset.length > 0 ? decision.captureSubset : []
      });
      const aiPlayedCardId = this.toCardId(decision.cardToPlay);
      const opponentPlayGroupId = this.cardAnimationOrchestrator.startGroup({
        actionType: "opponent-play",
        cardIds: [aiPlayedCardId]
      });
      this.cardAnimationOrchestrator.completeParticipant(opponentPlayGroupId, aiPlayedCardId, 100);
      const configuredAiPostConfirmPauseMs = this.turnPausePolicy.resolvePauseMs("ai-post-play-confirm", { reducedMotion });
      const opponentCompletionDelayMs = this.turnPausePolicy.hasRuntimeOverride() ? Math.max(1, Math.min(_GameTablePage.OPPONENT_PLAY_ANIMATION_DURATION_MS, configuredAiPostConfirmPauseMs)) : 0;
      if (opponentCompletionDelayMs === 0) {
        this.cardAnimationOrchestrator.finalizeGroup(opponentPlayGroupId);
      }
      const opponentPlayCompletion = opponentCompletionDelayMs === 0 ? Promise.resolve() : new Promise((resolve) => {
        this.scheduleAnimationGroupCompletion(opponentPlayGroupId, opponentCompletionDelayMs, () => {
          resolve();
        });
      });
      this.gameEngine.playCard(decision.cardToPlay, decision.captureSubset);
      await opponentPlayCompletion;
      await this.confirmTurnWithSequencing("ai-post-play-confirm", true);
      const aiEscobaCountAfterPlay = this.gameEngine.state()?.players.find((player) => player.id === aiPlayerId)?.escobaCount ?? aiEscobaCountBeforePlay;
      if (aiEscobaCountAfterPlay > aiEscobaCountBeforePlay) {
        this.announce("\xA1Escoba! Laia limpi\xF3 la mesa");
      } else if (decision.captureSubset.length > 0) {
        this.announce(`Laia captur\xF3 ${decision.captureSubset.length} cartas de la mesa`);
      } else {
        this.announce("Laia coloc\xF3 una carta en la mesa");
      }
    } catch (error) {
      console.warn("AI turn orchestration failed", {
        aiPlayerId,
        difficulty,
        turnPhase: this.gameEngine.turnPhase(),
        errorName: error instanceof Error ? error.name : "UnknownError"
      });
    } finally {
      this.isAiTurnInProgress.set(false);
      this.aiTurnAnimationState.set(AI_TURN_IDLE);
    }
  }
  areCardsEqual(left, right) {
    return left.suit === right.suit && left.rank === right.rank && left.value === right.value;
  }
  prefersReducedMotion() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  static \u0275fac = function GameTablePage_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GameTablePage)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _GameTablePage, selectors: [["app-game-table-page"]], features: [\u0275\u0275ProvidersFeature([TableInteractionState, CardAnimationOrchestrator, TurnPausePolicy])], decls: 16, vars: 48, consts: [["data-testid", "game-table-page", 1, "game-table-page"], [3, "startNextRound", "viewWinner", "activePlayerName", "currentRoundNumber", "scoreEntries", "turnPhase", "escobaOutcome", "roundResult", "matchWinner", "showStartNextRound", "showViewWinner", "roundScoreBreakdown", "handoffActive", "contextHeaderTestId"], [3, "message"], ["data-testid", "session-indicator"], ["data-testid", "table-layout-shell", 1, "table-layout-shell"], ["data-testid", "layout-opponents", 1, "layout-opponents"], [3, "opponents", "aiHandCardCount", "aiTurnAnimationState", "animationMetadata", "suppressAiAnimations"], ["data-testid", "layout-center", 1, "layout-center"], [3, "tableCardToggled", "tableCards", "selectedTableCards", "interactionEnabled", "preserveFocusOrderWhenBlocked", "animationMetadata"], ["data-testid", "layout-active-hand", 1, "layout-active-hand"], [3, "handCardSelected", "handCards", "selectedHandCard", "interactionEnabled", "preserveFocusOrderWhenBlocked", "animationMetadata"], [3, "submitPlayClicked", "confirmTurnClicked", "handoffToggleChanged", "canSubmitPlay", "isCaptureSelectionValid", "interactionEnabled", "submitLocked", "turnPhase", "validationMessage", "multiplayer", "handoffEnabled", "overlayBlocked"], [3, "winnerNames", "matchScoreEntries"], [3, "nextPlayerName"], ["data-testid", "next-turn-reveal"], [3, "returnToLobby", "playAgain", "winnerNames", "matchScoreEntries"], [3, "handoffAcknowledged", "nextPlayerName"]], template: function GameTablePage_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "section", 0)(1, "app-match-context-hud", 1);
      \u0275\u0275listener("startNextRound", function GameTablePage_Template_app_match_context_hud_startNextRound_1_listener() {
        return ctx.onStartNextRound();
      })("viewWinner", function GameTablePage_Template_app_match_context_hud_viewWinner_1_listener() {
        return ctx.onViewWinner();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275element(2, "app-a11y-live-region", 2);
      \u0275\u0275elementStart(3, "p", 3);
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "div", 4)(6, "div", 5);
      \u0275\u0275element(7, "app-opponent-zones", 6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "div", 7)(9, "app-center-table-zone", 8);
      \u0275\u0275listener("tableCardToggled", function GameTablePage_Template_app_center_table_zone_tableCardToggled_9_listener($event) {
        return ctx.onTableCardToggled($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(10, "div", 9)(11, "app-active-hand-zone", 10);
      \u0275\u0275listener("handCardSelected", function GameTablePage_Template_app_active_hand_zone_handCardSelected_11_listener($event) {
        return ctx.onHandCardSelected($event);
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(12, "app-play-action-bar", 11);
      \u0275\u0275listener("submitPlayClicked", function GameTablePage_Template_app_play_action_bar_submitPlayClicked_12_listener() {
        return ctx.submitPlay();
      })("confirmTurnClicked", function GameTablePage_Template_app_play_action_bar_confirmTurnClicked_12_listener() {
        return ctx.confirmTurn();
      })("handoffToggleChanged", function GameTablePage_Template_app_play_action_bar_handoffToggleChanged_12_listener($event) {
        return ctx.onHandoffToggleChanged($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(13, GameTablePage_Conditional_13_Template, 1, 2, "app-match-over-overlay", 12);
      \u0275\u0275conditionalCreate(14, GameTablePage_Conditional_14_Template, 1, 1, "app-turn-handoff-overlay", 13)(15, GameTablePage_Conditional_15_Template, 2, 1, "p", 14);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classProp("game-table-page--handoff-active", ctx.showTurnHandoffOverlay());
      \u0275\u0275advance();
      \u0275\u0275property("activePlayerName", ctx.activePlayerName())("currentRoundNumber", ctx.currentRoundNumber())("scoreEntries", ctx.scoreEntries())("turnPhase", ctx.turnPhase())("escobaOutcome", ctx.escobaOutcome())("roundResult", ctx.roundResult())("matchWinner", ctx.matchWinner())("showStartNextRound", ctx.showStartNextRoundButton())("showViewWinner", ctx.showViewWinnerButton())("roundScoreBreakdown", ctx.roundScoreBreakdown())("handoffActive", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay())("contextHeaderTestId", ctx.contextHeaderTestId());
      \u0275\u0275advance();
      \u0275\u0275property("message", ctx.liveAnnouncement());
      \u0275\u0275advance();
      \u0275\u0275attribute("aria-hidden", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay() ? "true" : null)("inert", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay() ? "" : null);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" Session configuration: ", ctx.hasSessionConfiguration() ? "ready" : "missing", " ");
      \u0275\u0275advance();
      \u0275\u0275attribute("aria-hidden", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay() ? "true" : null)("inert", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay() ? "" : null);
      \u0275\u0275advance(2);
      \u0275\u0275property("opponents", ctx.opponents())("aiHandCardCount", ctx.aiHandCardCount())("aiTurnAnimationState", ctx.aiTurnAnimationState())("animationMetadata", ctx.opponentAnimationMetadata())("suppressAiAnimations", ctx.suppressAiCardAnimations());
      \u0275\u0275advance(2);
      \u0275\u0275property("tableCards", ctx.tableCards())("selectedTableCards", ctx.selectedTableCards())("interactionEnabled", ctx.interactionEnabled())("preserveFocusOrderWhenBlocked", ctx.preserveCardFocusOrderWhenBlocked())("animationMetadata", ctx.centerTableAnimationMetadata());
      \u0275\u0275advance(2);
      \u0275\u0275property("handCards", ctx.activeHandCards())("selectedHandCard", ctx.selectedHandCard())("interactionEnabled", ctx.interactionEnabled())("preserveFocusOrderWhenBlocked", ctx.preserveCardFocusOrderWhenBlocked())("animationMetadata", ctx.activeHandAnimationMetadata());
      \u0275\u0275advance();
      \u0275\u0275property("canSubmitPlay", ctx.canSubmitPlay())("isCaptureSelectionValid", ctx.isCaptureSelectionValid())("interactionEnabled", ctx.interactionEnabled())("submitLocked", ctx.submitActionLocked())("turnPhase", ctx.turnPhase())("validationMessage", ctx.validationMessage())("multiplayer", ctx.isMultiplayer())("handoffEnabled", ctx.handoffEnabled())("overlayBlocked", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay());
      \u0275\u0275attribute("aria-hidden", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay() ? "true" : null)("inert", ctx.showTurnHandoffOverlay() || ctx.showMatchOverOverlay() ? "" : null);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showMatchOverOverlay() ? 13 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showTurnHandoffOverlay() ? 14 : 15);
    }
  }, dependencies: [
    A11yLiveRegion,
    MatchContextHud,
    OpponentZones,
    CenterTableZone,
    ActiveHandZone,
    PlayActionBar,
    TurnHandoffOverlay,
    MatchOverOverlay
  ], styles: ['\n.game-table-page[_ngcontent-%COMP%] {\n  position: relative;\n  isolation: isolate;\n  overflow: hidden;\n  min-height: 100vh;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  grid-template-rows: auto auto minmax(10rem, 1fr) auto auto;\n  gap: clamp(0.5rem, 2.4vw, 0.75rem);\n  padding: clamp(0.5rem, 2.8vw, 1rem);\n  color: #f7f3e8;\n  background-image: url(/tapete.png);\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n.game-table-page[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n  background-image:\n    linear-gradient(\n      180deg,\n      rgba(4, 14, 10, 0.58) 0%,\n      rgba(3, 10, 8, 0.72) 100%),\n    radial-gradient(\n      circle at top,\n      rgba(255, 255, 255, 0.08),\n      transparent 55%);\n}\n.game-table-page[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n}\n.game-table-page--handoff-active[_ngcontent-%COMP%]   app-match-context-hud[_ngcontent-%COMP%], \n.game-table-page--handoff-active[_ngcontent-%COMP%]   [data-testid=session-indicator][_ngcontent-%COMP%], \n.game-table-page--handoff-active[_ngcontent-%COMP%]   .table-layout-shell[_ngcontent-%COMP%], \n.game-table-page--handoff-active[_ngcontent-%COMP%]   app-play-action-bar[_ngcontent-%COMP%] {\n  filter: blur(8px);\n  pointer-events: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n[data-testid=session-indicator][_ngcontent-%COMP%] {\n  margin: 0;\n}\n.table-layout-shell[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  grid-template-rows: auto minmax(10rem, 1fr) auto;\n  gap: clamp(0.5rem, 2.4vw, 0.75rem);\n  min-height: 100%;\n}\n.layout-opponents[_ngcontent-%COMP%], \n.layout-center[_ngcontent-%COMP%], \n.layout-active-hand[_ngcontent-%COMP%], \napp-opponent-zones[_ngcontent-%COMP%], \napp-center-table-zone[_ngcontent-%COMP%], \napp-active-hand-zone[_ngcontent-%COMP%], \n.actions[_ngcontent-%COMP%] {\n  display: block;\n}\n.layout-opponents[_ngcontent-%COMP%] {\n  align-self: start;\n}\n.layout-center[_ngcontent-%COMP%], \napp-center-table-zone[_ngcontent-%COMP%] {\n  align-self: center;\n}\n.layout-active-hand[_ngcontent-%COMP%], \napp-active-hand-zone[_ngcontent-%COMP%] {\n  align-self: end;\n}\n.actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  font-weight: 600;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n[data-testid=play-validation-message][_ngcontent-%COMP%] {\n  margin: 0;\n  min-height: 1.5rem;\n}\n@media (max-width: 480px) {\n  .game-table-page[_ngcontent-%COMP%] {\n    grid-template-rows: auto auto minmax(12rem, 1fr) auto auto;\n  }\n}\n/*# sourceMappingURL=game-table-page.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GameTablePage, [{
    type: Component,
    args: [{ selector: "app-game-table-page", imports: [
      A11yLiveRegion,
      MatchContextHud,
      OpponentZones,
      CenterTableZone,
      ActiveHandZone,
      PlayActionBar,
      TurnHandoffOverlay,
      MatchOverOverlay
    ], providers: [TableInteractionState, CardAnimationOrchestrator, TurnPausePolicy], template: `<section
  class="game-table-page"
  [class.game-table-page--handoff-active]="showTurnHandoffOverlay()"
  data-testid="game-table-page"
>
  <app-match-context-hud
    [activePlayerName]="activePlayerName()"
    [currentRoundNumber]="currentRoundNumber()"
    [scoreEntries]="scoreEntries()"
    [turnPhase]="turnPhase()"
    [escobaOutcome]="escobaOutcome()"
    [roundResult]="roundResult()"
    [matchWinner]="matchWinner()"
    [showStartNextRound]="showStartNextRoundButton()"
    [showViewWinner]="showViewWinnerButton()"
    [roundScoreBreakdown]="roundScoreBreakdown()"
    [handoffActive]="showTurnHandoffOverlay() || showMatchOverOverlay()"
    [contextHeaderTestId]="contextHeaderTestId()"
    (startNextRound)="onStartNextRound()"
    (viewWinner)="onViewWinner()"
  ></app-match-context-hud>

  <app-a11y-live-region [message]="liveAnnouncement()"></app-a11y-live-region>

  <p
    data-testid="session-indicator"
    [attr.aria-hidden]="showTurnHandoffOverlay() || showMatchOverOverlay() ? 'true' : null"
    [attr.inert]="showTurnHandoffOverlay() || showMatchOverOverlay() ? '' : null"
  >
    Session configuration: {{ hasSessionConfiguration() ? 'ready' : 'missing' }}
  </p>

  <div
    class="table-layout-shell"
    data-testid="table-layout-shell"
    [attr.aria-hidden]="showTurnHandoffOverlay() || showMatchOverOverlay() ? 'true' : null"
    [attr.inert]="showTurnHandoffOverlay() || showMatchOverOverlay() ? '' : null"
  >
    <div class="layout-opponents" data-testid="layout-opponents">
      <app-opponent-zones
        [opponents]="opponents()"
        [aiHandCardCount]="aiHandCardCount()"
        [aiTurnAnimationState]="aiTurnAnimationState()"
        [animationMetadata]="opponentAnimationMetadata()"
        [suppressAiAnimations]="suppressAiCardAnimations()"
      ></app-opponent-zones>
    </div>

    <div class="layout-center" data-testid="layout-center">
      <app-center-table-zone
        [tableCards]="tableCards()"
        [selectedTableCards]="selectedTableCards()"
        [interactionEnabled]="interactionEnabled()"
        [preserveFocusOrderWhenBlocked]="preserveCardFocusOrderWhenBlocked()"
        [animationMetadata]="centerTableAnimationMetadata()"
        (tableCardToggled)="onTableCardToggled($event)"
      ></app-center-table-zone>
    </div>

    <div class="layout-active-hand" data-testid="layout-active-hand">
      <app-active-hand-zone
        [handCards]="activeHandCards()"
        [selectedHandCard]="selectedHandCard()"
        [interactionEnabled]="interactionEnabled()"
        [preserveFocusOrderWhenBlocked]="preserveCardFocusOrderWhenBlocked()"
        [animationMetadata]="activeHandAnimationMetadata()"
        (handCardSelected)="onHandCardSelected($event)"
      ></app-active-hand-zone>
    </div>
  </div>

  <app-play-action-bar
    [canSubmitPlay]="canSubmitPlay()"
    [isCaptureSelectionValid]="isCaptureSelectionValid()"
    [interactionEnabled]="interactionEnabled()"
    [submitLocked]="submitActionLocked()"
    [turnPhase]="turnPhase()"
    [validationMessage]="validationMessage()"
    [multiplayer]="isMultiplayer()"
    [handoffEnabled]="handoffEnabled()"
    [overlayBlocked]="showTurnHandoffOverlay() || showMatchOverOverlay()"
    (submitPlayClicked)="submitPlay()"
    (confirmTurnClicked)="confirmTurn()"
    (handoffToggleChanged)="onHandoffToggleChanged($event)"
    [attr.aria-hidden]="showTurnHandoffOverlay() || showMatchOverOverlay() ? 'true' : null"
    [attr.inert]="showTurnHandoffOverlay() || showMatchOverOverlay() ? '' : null"
  ></app-play-action-bar>

  @if (showMatchOverOverlay()) {
    <app-match-over-overlay
      [winnerNames]="winnerNames()"
      [matchScoreEntries]="matchScoreEntries()"
      (returnToLobby)="onReturnToLobby()"
      (playAgain)="onPlayAgain()"
    ></app-match-over-overlay>
  }

  @if (showTurnHandoffOverlay()) {
    <app-turn-handoff-overlay
      [nextPlayerName]="activePlayerName()"
      (handoffAcknowledged)="onHandoffAcknowledged()"
    ></app-turn-handoff-overlay>
  } @else {
    <p data-testid="next-turn-reveal">Next turn: {{ activePlayerName() }}</p>
  }
</section>
`, styles: ['/* src/app/features/game-board/game-table-page/game-table-page.scss */\n.game-table-page {\n  position: relative;\n  isolation: isolate;\n  overflow: hidden;\n  min-height: 100vh;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  grid-template-rows: auto auto minmax(10rem, 1fr) auto auto;\n  gap: clamp(0.5rem, 2.4vw, 0.75rem);\n  padding: clamp(0.5rem, 2.8vw, 1rem);\n  color: #f7f3e8;\n  background-image: url(/tapete.png);\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n.game-table-page::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n  background-image:\n    linear-gradient(\n      180deg,\n      rgba(4, 14, 10, 0.58) 0%,\n      rgba(3, 10, 8, 0.72) 100%),\n    radial-gradient(\n      circle at top,\n      rgba(255, 255, 255, 0.08),\n      transparent 55%);\n}\n.game-table-page > * {\n  position: relative;\n  z-index: 1;\n}\n.game-table-page--handoff-active app-match-context-hud,\n.game-table-page--handoff-active [data-testid=session-indicator],\n.game-table-page--handoff-active .table-layout-shell,\n.game-table-page--handoff-active app-play-action-bar {\n  filter: blur(8px);\n  pointer-events: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n[data-testid=session-indicator] {\n  margin: 0;\n}\n.table-layout-shell {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  grid-template-rows: auto minmax(10rem, 1fr) auto;\n  gap: clamp(0.5rem, 2.4vw, 0.75rem);\n  min-height: 100%;\n}\n.layout-opponents,\n.layout-center,\n.layout-active-hand,\napp-opponent-zones,\napp-center-table-zone,\napp-active-hand-zone,\n.actions {\n  display: block;\n}\n.layout-opponents {\n  align-self: start;\n}\n.layout-center,\napp-center-table-zone {\n  align-self: center;\n}\n.layout-active-hand,\napp-active-hand-zone {\n  align-self: end;\n}\n.actions {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.actions button {\n  border: 0;\n  border-radius: 0.5rem;\n  padding: 0.5rem 0.875rem;\n  font-weight: 600;\n  color: #173a2a;\n  background: #f1e2bd;\n}\n[data-testid=play-validation-message] {\n  margin: 0;\n  min-height: 1.5rem;\n}\n@media (max-width: 480px) {\n  .game-table-page {\n    grid-template-rows: auto auto minmax(12rem, 1fr) auto auto;\n  }\n}\n/*# sourceMappingURL=game-table-page.css.map */\n'] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(GameTablePage, { className: "GameTablePage", filePath: "src/app/features/game-board/game-table-page/game-table-page.ts", lineNumber: 82 });
})();
export {
  GameTablePage
};
//# sourceMappingURL=chunk-CTMKCV32.js.map

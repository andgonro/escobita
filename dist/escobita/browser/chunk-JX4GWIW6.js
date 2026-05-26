import {
  Injectable,
  __spreadProps,
  __spreadValues,
  computed,
  isDevMode,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-PEZOI2E3.js";

// src/app/core/utils/deck.utils.ts
var SUITS = ["Oros", "Copas", "Espadas", "Bastos"];
var RANK_VALUES = /* @__PURE__ */ new Map([
  ["1", 1],
  ["2", 2],
  ["3", 3],
  ["4", 4],
  ["5", 5],
  ["6", 6],
  ["7", 7],
  ["Sota", 8],
  ["Caballo", 9],
  ["Rey", 10]
]);
function randomInt(maxExclusive) {
  if (maxExclusive <= 1) {
    return 0;
  }
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure random source is not available.");
  }
  const maxUint32 = 4294967296;
  const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  do {
    cryptoApi.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % maxExclusive;
}
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const [rank, value] of RANK_VALUES) {
      deck.push(Object.freeze({ suit, rank, value }));
    }
  }
  return deck;
}
function shuffleDeck(deck) {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// src/app/core/utils/scoring.utils.ts
function scoreEscobas(players) {
  const result = /* @__PURE__ */ new Map();
  for (const player of players) {
    result.set(player.id, player.escobaCount);
  }
  return result;
}
function scoreMostCards(players) {
  const counts = players.map((p) => p.capturedPile.length);
  const max = Math.max(...counts);
  const winners = players.filter((p) => p.capturedPile.length === max);
  const result = /* @__PURE__ */ new Map();
  for (const player of players) {
    if (winners.length === 1 && player.id === winners[0].id) {
      result.set(player.id, max === 40 ? 2 : 1);
    } else {
      result.set(player.id, 0);
    }
  }
  return result;
}
function scoreMostOros(players) {
  const countOros = (p) => p.capturedPile.filter((c) => c.suit === "Oros").length;
  const counts = players.map(countOros);
  const max = Math.max(...counts);
  const winners = players.filter((p) => countOros(p) === max);
  const result = /* @__PURE__ */ new Map();
  for (const player of players) {
    if (winners.length === 1 && player.id === winners[0].id) {
      result.set(player.id, max === 10 ? 2 : 1);
    } else {
      result.set(player.id, 0);
    }
  }
  return result;
}
function scoreMostSevens(players) {
  const countSevens = (p) => p.capturedPile.filter((c) => c.rank === "7").length;
  const counts = players.map(countSevens);
  const max = Math.max(...counts);
  const winners = players.filter((p) => countSevens(p) === max);
  const result = /* @__PURE__ */ new Map();
  for (const player of players) {
    if (winners.length === 1 && player.id === winners[0].id) {
      result.set(player.id, max === 4 ? 2 : 1);
    } else {
      result.set(player.id, 0);
    }
  }
  return result;
}
function scoreSieteDeVelo(players) {
  const isSieteDeVelo = (c) => c.suit === "Oros" && c.rank === "7";
  const result = /* @__PURE__ */ new Map();
  for (const player of players) {
    result.set(player.id, player.capturedPile.some(isSieteDeVelo) ? 1 : 0);
  }
  return result;
}
function computeRoundResult(players, roundNumber, _lastCapturerId) {
  const escobas = scoreEscobas(players);
  const mostCards = scoreMostCards(players);
  const mostOros = scoreMostOros(players);
  const mostSevens = scoreMostSevens(players);
  const sieteDiVelo = scoreSieteDeVelo(players);
  const playerScores = players.map((player) => {
    const escobasPoints = escobas.get(player.id) ?? 0;
    const mostCardsPoints = mostCards.get(player.id) ?? 0;
    const mostOrosPoints = mostOros.get(player.id) ?? 0;
    const mostSevensPoints = mostSevens.get(player.id) ?? 0;
    const sieteDiVeloPoints = sieteDiVelo.get(player.id) ?? 0;
    const total = escobasPoints + mostCardsPoints + mostOrosPoints + mostSevensPoints + sieteDiVeloPoints;
    return {
      playerId: player.id,
      escobas: escobasPoints,
      mostCards: mostCardsPoints,
      mostOros: mostOrosPoints,
      mostSevens: mostSevensPoints,
      sieteDiVelo: sieteDiVeloPoints,
      total
    };
  });
  return { roundNumber, playerScores };
}

// src/app/core/utils/win-condition.utils.ts
var WIN_THRESHOLD = 15;
function checkWinCondition(matchScores, players) {
  const qualifiers = players.filter((p) => (matchScores[p.id] ?? 0) >= WIN_THRESHOLD);
  if (qualifiers.length === 0)
    return null;
  const highScore = Math.max(...qualifiers.map((p) => matchScores[p.id]));
  const leaders = qualifiers.filter((p) => matchScores[p.id] === highScore);
  return leaders;
}

// src/app/core/services/game-engine.ts
function cardEq(a, b) {
  return a.suit === b.suit && a.rank === b.rank;
}
function bytesToUuidV4(bytes) {
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join("-");
}
function generateId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure random source is not available for player id generation.");
  }
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return bytesToUuidV4(bytes);
}
function warn(message) {
  if (isDevMode()) {
    console.warn(message);
  }
}
function buildPlayers(playerNames) {
  return playerNames.map((name) => ({
    id: generateId(),
    name,
    hand: [],
    capturedPile: [],
    escobaCount: 0
  }));
}
function dealInitialState(shuffled, players, matchScores, roundNumber) {
  const remaining = [...shuffled];
  const table = remaining.splice(0, 4);
  const dealtPlayers = players.map((p) => __spreadProps(__spreadValues({}, p), {
    hand: remaining.splice(0, 3),
    capturedPile: [],
    escobaCount: 0
  }));
  return {
    deck: remaining,
    table,
    players: dealtPlayers,
    turnIndex: 0,
    roundNumber,
    matchScores,
    lastCapturerId: null
  };
}
function freezeArray(items) {
  return Object.freeze([...items]);
}
function freezePlayer(player) {
  return Object.freeze(__spreadProps(__spreadValues({}, player), {
    hand: freezeArray(player.hand),
    capturedPile: freezeArray(player.capturedPile)
  }));
}
function freezeGameState(state) {
  return Object.freeze(__spreadProps(__spreadValues({}, state), {
    deck: freezeArray(state.deck),
    table: freezeArray(state.table),
    players: freezeArray(state.players.map(freezePlayer)),
    matchScores: Object.freeze(__spreadValues({}, state.matchScores))
  }));
}
var GameEngine = class _GameEngine {
  // Private writable signals (AD-2, AD-3, AD-8)
  _state = signal(null, ...ngDevMode ? [{ debugName: "_state" }] : (
    /* istanbul ignore next */
    []
  ));
  _turnPhase = signal("awaiting-card-play", ...ngDevMode ? [{ debugName: "_turnPhase" }] : (
    /* istanbul ignore next */
    []
  ));
  _roundResult = signal(null, ...ngDevMode ? [{ debugName: "_roundResult" }] : (
    /* istanbul ignore next */
    []
  ));
  _matchWinner = signal(null, ...ngDevMode ? [{ debugName: "_matchWinner" }] : (
    /* istanbul ignore next */
    []
  ));
  // Public read-only signals (TR-4.3, NFR-2.1)
  state = this._state.asReadonly();
  turnPhase = this._turnPhase.asReadonly();
  roundResult = this._roundResult.asReadonly();
  matchWinner = this._matchWinner.asReadonly();
  /** Computed signal: derives the active player from current state. */
  activePlayer = computed(() => {
    const s = this._state();
    if (!s)
      return null;
    return s.players[s.turnIndex] ?? null;
  }, ...ngDevMode ? [{ debugName: "activePlayer" }] : (
    /* istanbul ignore next */
    []
  ));
  /**
   * Applies deterministic fixture snapshots for Cypress E2E setup through a controlled, public seam.
   * This avoids test-time private signal mutation from outside the service boundary.
   */
  applyE2eFixture(fixture) {
    if (!isDevMode()) {
      throw new Error("[GameEngine] applyE2eFixture is only available in dev mode.");
    }
    const state = this._state();
    if (!state) {
      throw new Error("[GameEngine] applyE2eFixture requires an initialized game state.");
    }
    switch (fixture) {
      case "escoba-visibility": {
        const escobaPlayer = state.players[0] ?? null;
        if (!escobaPlayer) {
          throw new Error("[GameEngine] escoba fixture requires at least one player.");
        }
        const escobaCount = Math.max(1, escobaPlayer.escobaCount + 1);
        const escobaState = __spreadProps(__spreadValues({}, state), {
          table: [],
          lastCapturerId: escobaPlayer.id,
          players: state.players.map((player) => {
            if (player.id !== escobaPlayer.id) {
              return player;
            }
            return __spreadProps(__spreadValues({}, player), {
              escobaCount
            });
          })
        });
        this._state.set(freezeGameState(escobaState));
        return {
          escobaPlayerName: escobaPlayer.name,
          escobaCount
        };
      }
      case "round-winner-visibility": {
        const winner = state.players[0] ?? null;
        if (!winner) {
          throw new Error("[GameEngine] round/winner fixture requires at least one player.");
        }
        const roundResult = {
          roundNumber: state.roundNumber + 41,
          playerScores: state.players.map((player, playerIndex) => ({
            playerId: player.id,
            escobas: playerIndex === 0 ? 2 : 0,
            mostCards: playerIndex === 0 ? 1 : 0,
            mostOros: playerIndex === 0 ? 1 : 0,
            mostSevens: playerIndex === 0 ? 1 : 0,
            sieteDiVelo: 0,
            total: playerIndex === 0 ? 13 : 1
          }))
        };
        this._roundResult.set(roundResult);
        this._matchWinner.set([winner]);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber: roundResult.roundNumber,
          winnerName: winner.name,
          topScore: roundResult.playerScores[0]?.total ?? 0
        };
      }
      case "round-winner-visibility-ai": {
        const winner = state.players[1] ?? null;
        if (!winner) {
          throw new Error("[GameEngine] AI winner fixture requires at least two players.");
        }
        const roundResult = {
          roundNumber: state.roundNumber + 41,
          playerScores: state.players.map((player, playerIndex) => ({
            playerId: player.id,
            escobas: playerIndex === 1 ? 2 : 0,
            mostCards: playerIndex === 1 ? 1 : 0,
            mostOros: playerIndex === 1 ? 1 : 0,
            mostSevens: playerIndex === 1 ? 1 : 0,
            sieteDiVelo: 0,
            total: playerIndex === 1 ? 13 : 1
          }))
        };
        this._roundResult.set(roundResult);
        this._matchWinner.set([winner]);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber: roundResult.roundNumber,
          winnerName: winner.name,
          topScore: roundResult.playerScores[1]?.total ?? 0
        };
      }
      case "round-co-winner-visibility": {
        const winnerA = state.players[0] ?? null;
        const winnerB = state.players[1] ?? null;
        if (!winnerA || !winnerB) {
          throw new Error("[GameEngine] co-winner fixture requires at least two players.");
        }
        const roundNumber = state.roundNumber + 57;
        const topScore = 7;
        const roundResult = {
          roundNumber,
          playerScores: state.players.map((player, playerIndex) => {
            if (playerIndex < 2) {
              return {
                playerId: player.id,
                escobas: 1,
                mostCards: 1,
                mostOros: 0,
                mostSevens: 0,
                sieteDiVelo: 0,
                total: topScore
              };
            }
            return {
              playerId: player.id,
              escobas: 0,
              mostCards: 0,
              mostOros: 0,
              mostSevens: 0,
              sieteDiVelo: 0,
              total: 0
            };
          })
        };
        const players = state.players.map((player) => __spreadProps(__spreadValues({}, player), {
          hand: []
        }));
        const coWinnerState = __spreadProps(__spreadValues({}, state), {
          deck: [],
          table: [...state.table],
          players,
          turnIndex: 0,
          roundNumber,
          matchScores: players.reduce((scoreMap, player, playerIndex) => {
            scoreMap[player.id] = playerIndex < 2 ? 16 : 8;
            return scoreMap;
          }, {}),
          lastCapturerId: players[0]?.id ?? null
        });
        this._state.set(freezeGameState(coWinnerState));
        this._roundResult.set(roundResult);
        this._matchWinner.set([winnerA, winnerB]);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber,
          winnerName: `${winnerA.name}, ${winnerB.name}`,
          topScore
        };
      }
      case "round-complete-no-winner": {
        const roundNumber = 2;
        const roundCompleteTable = [
          { suit: "Bastos", rank: "6", value: 6 },
          { suit: "Oros", rank: "2", value: 2 }
        ];
        const playerScores = state.players.map((player, playerIndex) => {
          if (playerIndex === 0) {
            return {
              playerId: player.id,
              escobas: 0,
              mostCards: 0,
              mostOros: 0,
              mostSevens: 1,
              sieteDiVelo: 0,
              total: 1
            };
          }
          if (playerIndex === 1) {
            return {
              playerId: player.id,
              escobas: 1,
              mostCards: 1,
              mostOros: 1,
              mostSevens: 0,
              sieteDiVelo: 0,
              total: 3
            };
          }
          return {
            playerId: player.id,
            escobas: 0,
            mostCards: 0,
            mostOros: 0,
            mostSevens: 0,
            sieteDiVelo: 0,
            total: 0
          };
        });
        const topScore = playerScores.reduce((currentTopScore, score) => {
          return Math.max(currentTopScore, score.total);
        }, 0);
        const roundResult = {
          roundNumber,
          playerScores
        };
        const players = state.players.map((player) => __spreadProps(__spreadValues({}, player), {
          hand: []
        }));
        const fallbackScores = [6, 7, 5, 4];
        const matchScores = players.reduce((scoreMap, player, index) => {
          scoreMap[player.id] = fallbackScores[index] ?? 0;
          return scoreMap;
        }, {});
        const roundCompleteState = __spreadProps(__spreadValues({}, state), {
          deck: [],
          table: roundCompleteTable,
          players,
          turnIndex: 0,
          roundNumber,
          matchScores,
          lastCapturerId: players[0]?.id ?? null
        });
        this._state.set(freezeGameState(roundCompleteState));
        this._roundResult.set(roundResult);
        this._matchWinner.set(null);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber,
          topScore
        };
      }
      case "pre-final-turn-no-winner": {
        const preFinalTurnTable = [
          { suit: "Espadas", rank: "2", value: 2 },
          { suit: "Oros", rank: "1", value: 1 }
        ];
        const players = state.players.map((player, playerIndex) => {
          const capturedPile = playerIndex === 0 ? [{ suit: "Copas", rank: "3", value: 3 }] : [];
          return __spreadProps(__spreadValues({}, player), {
            hand: [],
            capturedPile,
            escobaCount: 0
          });
        });
        const matchScores = players.reduce((scoreMap, player) => {
          scoreMap[player.id] = 0;
          return scoreMap;
        }, {});
        const preFinalTurnState = __spreadProps(__spreadValues({}, state), {
          deck: [],
          table: preFinalTurnTable,
          players,
          turnIndex: 0,
          roundNumber: 1,
          matchScores,
          lastCapturerId: players[0]?.id ?? null
        });
        this._state.set(freezeGameState(preFinalTurnState));
        this._roundResult.set(null);
        this._matchWinner.set(null);
        this._turnPhase.set("awaiting-confirmation");
        return {
          roundNumber: preFinalTurnState.roundNumber,
          topScore: 0
        };
      }
      case "ai-turn-escoba": {
        const humanPlayer = state.players[0] ?? null;
        const aiPlayer = state.players[1] ?? null;
        if (!humanPlayer || !aiPlayer) {
          throw new Error("[GameEngine] ai-turn fixtures require at least two players.");
        }
        const aiEscobaHand = [
          { suit: "Bastos", rank: "3", value: 3 },
          { suit: "Oros", rank: "7", value: 7 },
          { suit: "Copas", rank: "1", value: 1 }
        ];
        const aiEscobaTable = [
          { suit: "Espadas", rank: "5", value: 5 },
          { suit: "Oros", rank: "4", value: 4 },
          { suit: "Copas", rank: "3", value: 3 }
        ];
        const players = state.players.map((player, index) => {
          if (index === 0) {
            return __spreadProps(__spreadValues({}, player), {
              hand: [{ suit: "Bastos", rank: "6", value: 6 }],
              capturedPile: [],
              escobaCount: 0
            });
          }
          if (index === 1) {
            return __spreadProps(__spreadValues({}, player), {
              name: "Laia",
              hand: aiEscobaHand,
              capturedPile: [],
              escobaCount: 0
            });
          }
          return __spreadProps(__spreadValues({}, player), {
            hand: [],
            capturedPile: [],
            escobaCount: 0
          });
        });
        const matchScores = players.reduce((scoreMap, player) => {
          scoreMap[player.id] = 0;
          return scoreMap;
        }, {});
        const escobaTurnState = __spreadProps(__spreadValues({}, state), {
          deck: [],
          table: aiEscobaTable,
          players,
          turnIndex: 1,
          roundNumber: 1,
          matchScores,
          lastCapturerId: null
        });
        this._state.set(freezeGameState(escobaTurnState));
        this._roundResult.set(null);
        this._matchWinner.set(null);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber: escobaTurnState.roundNumber
        };
      }
      case "ai-turn-capture": {
        const humanPlayer = state.players[0] ?? null;
        const aiPlayer = state.players[1] ?? null;
        if (!humanPlayer || !aiPlayer) {
          throw new Error("[GameEngine] ai-turn fixtures require at least two players.");
        }
        const aiCaptureHand = [
          { suit: "Oros", rank: "Caballo", value: 9 },
          { suit: "Copas", rank: "4", value: 4 },
          { suit: "Espadas", rank: "1", value: 1 }
        ];
        const aiCaptureTable = [
          { suit: "Bastos", rank: "6", value: 6 },
          { suit: "Oros", rank: "4", value: 4 },
          { suit: "Copas", rank: "2", value: 2 }
        ];
        const players = state.players.map((player, index) => {
          if (index === 0) {
            return __spreadProps(__spreadValues({}, player), {
              hand: [{ suit: "Bastos", rank: "5", value: 5 }],
              capturedPile: [],
              escobaCount: 0
            });
          }
          if (index === 1) {
            return __spreadProps(__spreadValues({}, player), {
              name: "Laia",
              hand: aiCaptureHand,
              capturedPile: [],
              escobaCount: 0
            });
          }
          return __spreadProps(__spreadValues({}, player), {
            hand: [],
            capturedPile: [],
            escobaCount: 0
          });
        });
        const matchScores = players.reduce((scoreMap, player) => {
          scoreMap[player.id] = 0;
          return scoreMap;
        }, {});
        const captureTurnState = __spreadProps(__spreadValues({}, state), {
          deck: [],
          table: aiCaptureTable,
          players,
          turnIndex: 1,
          roundNumber: 1,
          matchScores,
          lastCapturerId: null
        });
        this._state.set(freezeGameState(captureTurnState));
        this._roundResult.set(null);
        this._matchWinner.set(null);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber: captureTurnState.roundNumber
        };
      }
      case "ai-turn-placement": {
        const humanPlayer = state.players[0] ?? null;
        const aiPlayer = state.players[1] ?? null;
        if (!humanPlayer || !aiPlayer) {
          throw new Error("[GameEngine] ai-turn fixtures require at least two players.");
        }
        const aiPlacementHand = [{ suit: "Copas", rank: "Sota", value: 8 }];
        const aiPlacementTable = [
          { suit: "Bastos", rank: "1", value: 1 },
          { suit: "Oros", rank: "1", value: 1 },
          { suit: "Espadas", rank: "1", value: 1 }
        ];
        const players = state.players.map((player, index) => {
          if (index === 0) {
            return __spreadProps(__spreadValues({}, player), {
              hand: [{ suit: "Bastos", rank: "5", value: 5 }],
              capturedPile: [],
              escobaCount: 0
            });
          }
          if (index === 1) {
            return __spreadProps(__spreadValues({}, player), {
              name: "Laia",
              hand: aiPlacementHand,
              capturedPile: [],
              escobaCount: 0
            });
          }
          return __spreadProps(__spreadValues({}, player), {
            hand: [],
            capturedPile: [],
            escobaCount: 0
          });
        });
        const matchScores = players.reduce((scoreMap, player) => {
          scoreMap[player.id] = 0;
          return scoreMap;
        }, {});
        const placementTurnState = __spreadProps(__spreadValues({}, state), {
          deck: [],
          table: aiPlacementTable,
          players,
          turnIndex: 1,
          roundNumber: 1,
          matchScores,
          lastCapturerId: null
        });
        this._state.set(freezeGameState(placementTurnState));
        this._roundResult.set(null);
        this._matchWinner.set(null);
        this._turnPhase.set("awaiting-card-play");
        return {
          roundNumber: placementTurnState.roundNumber
        };
      }
      default:
        throw new Error(`[GameEngine] Unknown E2E fixture: ${fixture}`);
    }
  }
  // ---------------------------------------------------------------------------
  // T-8: initGame
  // ---------------------------------------------------------------------------
  /**
   * Initialises a new match from the provided GameConfiguration.
   * Resets all signals; deals initial table cards and player hands.
   * Covers FR-2.1–FR-2.5, TR-4.4, US-1.
   */
  initGame(config) {
    const players = buildPlayers(config.playerNames);
    const matchScores = {};
    for (const player of players) {
      matchScores[player.id] = 0;
    }
    const shuffled = shuffleDeck(createDeck());
    const initialState = dealInitialState(shuffled, players, matchScores, 1);
    this._state.set(freezeGameState(initialState));
    this._turnPhase.set("awaiting-card-play");
    this._roundResult.set(null);
    this._matchWinner.set(null);
  }
  // ---------------------------------------------------------------------------
  // T-9: playCard
  // ---------------------------------------------------------------------------
  /**
   * Executes a card play for the currently active player.
   * Validates the action and applies the state transition (capture or table placement).
   * Transitions turn phase to 'awaiting-confirmation'.
   * Covers FR-5.1–FR-5.8, TR-4.4, TR-4.6, US-3, US-4, US-5.
   */
  playCard(card, captureSubset) {
    const state = this._state();
    if (!state) {
      warn("[GameEngine] playCard called before game was initialised.");
      return;
    }
    if (this._turnPhase() !== "awaiting-card-play") {
      warn("[GameEngine] playCard rejected: turn phase is not awaiting-card-play.");
      return;
    }
    const activePlayer = state.players[state.turnIndex];
    const cardInHand = activePlayer.hand.find((c) => cardEq(c, card));
    if (!cardInHand) {
      warn("[GameEngine] playCard rejected: card-not-in-active-hand.");
      return;
    }
    if (captureSubset.length > 0) {
      const subsetKeys = /* @__PURE__ */ new Set();
      for (const subsetCard of captureSubset) {
        const key = `${subsetCard.suit}-${subsetCard.rank}`;
        if (subsetKeys.has(key)) {
          warn("[GameEngine] playCard rejected: capture-subset-contains-duplicates.");
          return;
        }
        subsetKeys.add(key);
        if (!state.table.some((tc) => cardEq(tc, subsetCard))) {
          warn("[GameEngine] playCard rejected: capture-subset-card-not-on-table.");
          return;
        }
      }
      const subsetSum = captureSubset.reduce((sum, c) => sum + c.value, 0);
      if (card.value + subsetSum !== 15) {
        warn("[GameEngine] playCard rejected: invalid-capture-subset-sum.");
        return;
      }
    }
    let newTable;
    let newHand;
    let newCapturedPile;
    let newEscobaCount;
    let newLastCapturerId = state.lastCapturerId;
    if (captureSubset.length > 0) {
      newHand = activePlayer.hand.filter((c) => !cardEq(c, card));
      newTable = state.table.filter((tc) => !captureSubset.some((sc) => cardEq(tc, sc)));
      newCapturedPile = [...activePlayer.capturedPile, card, ...captureSubset];
      newLastCapturerId = activePlayer.id;
      newEscobaCount = newTable.length === 0 ? activePlayer.escobaCount + 1 : activePlayer.escobaCount;
    } else {
      newHand = activePlayer.hand.filter((c) => !cardEq(c, card));
      newTable = [...state.table, card];
      newCapturedPile = activePlayer.capturedPile;
      newEscobaCount = activePlayer.escobaCount;
    }
    const updatedPlayer = __spreadProps(__spreadValues({}, activePlayer), {
      hand: newHand,
      capturedPile: newCapturedPile,
      escobaCount: newEscobaCount
    });
    const updatedPlayers = state.players.map((p, i) => i === state.turnIndex ? updatedPlayer : p);
    const newState = __spreadProps(__spreadValues({}, state), {
      table: newTable,
      players: updatedPlayers,
      lastCapturerId: newLastCapturerId
    });
    this._state.set(freezeGameState(newState));
    this._turnPhase.set("awaiting-confirmation");
  }
  // ---------------------------------------------------------------------------
  // T-10: confirmTurn
  // ---------------------------------------------------------------------------
  /**
   * Called by the active player after reviewing their play.
   * Advances the turn to the next player. May trigger end-of-hand dealing
   * or end-of-round resolution.
   * Covers FR-4.1–FR-4.4, FR-5.8, FR-6.1–FR-6.3, FR-7.1–FR-7.3,
   *        FR-8.1–FR-8.4, FR-9.1–FR-9.5, TR-4.4, TR-4.6.
   */
  confirmTurn() {
    const state = this._state();
    if (!state) {
      warn("[GameEngine] confirmTurn called before game was initialised.");
      return;
    }
    if (this._turnPhase() !== "awaiting-confirmation") {
      warn("[GameEngine] confirmTurn rejected: turn phase is not awaiting-confirmation.");
      return;
    }
    const nextTurnIndex = (state.turnIndex + 1) % state.players.length;
    const allHandsEmpty = state.players.every((p) => p.hand.length === 0);
    if (!allHandsEmpty) {
      const newState = __spreadProps(__spreadValues({}, state), { turnIndex: nextTurnIndex });
      this._state.set(freezeGameState(newState));
      this._turnPhase.set("awaiting-card-play");
      return;
    }
    if (state.deck.length > 0) {
      const newState = this.dealNextBatch(state, nextTurnIndex);
      this._state.set(freezeGameState(newState));
      this._turnPhase.set("awaiting-card-play");
      return;
    }
    const stateAfterAward = this.awardRemainingTableCards(state);
    const roundResult = computeRoundResult(stateAfterAward.players, stateAfterAward.roundNumber, stateAfterAward.lastCapturerId);
    const updatedMatchScores = __spreadValues({}, stateAfterAward.matchScores);
    for (const score of roundResult.playerScores) {
      updatedMatchScores[score.playerId] = (updatedMatchScores[score.playerId] ?? 0) + score.total;
    }
    const stateWithScores = __spreadProps(__spreadValues({}, stateAfterAward), {
      matchScores: updatedMatchScores,
      turnIndex: nextTurnIndex
    });
    const winner = checkWinCondition(updatedMatchScores, stateWithScores.players);
    this._state.set(freezeGameState(stateWithScores));
    this._roundResult.set(roundResult);
    this._matchWinner.set(winner);
    this._turnPhase.set("awaiting-card-play");
  }
  // ---------------------------------------------------------------------------
  // T-11: startNextRound
  // ---------------------------------------------------------------------------
  /**
   * Starts a new round after the current round has been resolved.
   * Validates that no match winner exists and the round is fully complete.
   * Rotates the dealer, resets per-round state, deals fresh cards.
   * Covers FR-10.1–FR-10.3, US-10.
   */
  startNextRound() {
    const state = this._state();
    if (!state) {
      warn("[GameEngine] startNextRound called before game was initialised.");
      return;
    }
    const roundComplete = state.deck.length === 0 && state.players.every((p) => p.hand.length === 0);
    if (!roundComplete) {
      warn("[GameEngine] startNextRound rejected: round is not yet complete.");
      return;
    }
    if (this._matchWinner() !== null) {
      warn("[GameEngine] startNextRound rejected: a match winner has already been declared.");
      return;
    }
    const newDealerIndex = (state.turnIndex + 1) % state.players.length;
    const resetPlayers = state.players.map((p) => __spreadProps(__spreadValues({}, p), {
      hand: [],
      capturedPile: [],
      escobaCount: 0
    }));
    const shuffled = shuffleDeck(createDeck());
    const newRoundNumber = state.roundNumber + 1;
    const newState = dealInitialStateFromDealer(shuffled, resetPlayers, state.matchScores, newRoundNumber, newDealerIndex);
    this._state.set(freezeGameState(newState));
    this._roundResult.set(null);
    this._turnPhase.set("awaiting-card-play");
  }
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  /** Deals the next batch of up to 3 cards per player starting from nextTurnIndex order (FR-6.2, FR-6.3). */
  dealNextBatch(state, nextTurnIndex) {
    const remainingDeck = [...state.deck];
    const playerCount = state.players.length;
    const updatedPlayers = [...state.players];
    for (let i = 0; i < playerCount; i++) {
      const playerIdx = (nextTurnIndex + i) % playerCount;
      const cardsToGive = Math.min(3, remainingDeck.length);
      updatedPlayers[playerIdx] = __spreadProps(__spreadValues({}, updatedPlayers[playerIdx]), {
        hand: remainingDeck.splice(0, cardsToGive)
      });
      if (remainingDeck.length === 0)
        break;
    }
    return __spreadProps(__spreadValues({}, state), {
      deck: remainingDeck,
      players: updatedPlayers,
      turnIndex: nextTurnIndex
    });
  }
  /** Awards remaining table cards to the last capturer (FR-7.2). Does NOT increment escobaCount (FR-7.3). */
  awardRemainingTableCards(state) {
    if (state.table.length === 0)
      return state;
    let recipientIndex;
    if (state.lastCapturerId !== null) {
      const idx = state.players.findIndex((p) => p.id === state.lastCapturerId);
      recipientIndex = idx >= 0 ? idx : state.players.length - 1;
    } else {
      recipientIndex = state.players.length - 1;
    }
    const recipient = state.players[recipientIndex];
    const updatedRecipient = __spreadProps(__spreadValues({}, recipient), {
      capturedPile: [...recipient.capturedPile, ...state.table]
      // escobaCount is NOT incremented (FR-7.3)
    });
    const updatedPlayers = state.players.map((p, i) => i === recipientIndex ? updatedRecipient : p);
    return __spreadProps(__spreadValues({}, state), { table: [], players: updatedPlayers });
  }
  static \u0275fac = function GameEngine_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GameEngine)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _GameEngine, factory: _GameEngine.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GameEngine, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();
function dealInitialStateFromDealer(shuffled, players, matchScores, roundNumber, dealerIndex) {
  const remaining = [...shuffled];
  const table = remaining.splice(0, 4);
  const playerCount = players.length;
  const dealtPlayers = [...players];
  for (let i = 0; i < playerCount; i++) {
    const playerIdx = (dealerIndex + i) % playerCount;
    dealtPlayers[playerIdx] = __spreadProps(__spreadValues({}, dealtPlayers[playerIdx]), {
      hand: remaining.splice(0, 3)
    });
  }
  return {
    deck: remaining,
    table,
    players: dealtPlayers,
    turnIndex: dealerIndex,
    roundNumber,
    matchScores,
    lastCapturerId: null
  };
}

export {
  createDeck,
  scoreEscobas,
  scoreMostCards,
  scoreMostOros,
  scoreMostSevens,
  scoreSieteDeVelo,
  GameEngine
};
//# sourceMappingURL=chunk-JX4GWIW6.js.map

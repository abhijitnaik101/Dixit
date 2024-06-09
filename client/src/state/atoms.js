// src/state/atoms.js
import { atom } from 'recoil';

export const roomState = atom({
  key: 'roomState',
  default: '',
});

export const deckState = atom({
  key: 'deckState',
  default : [],
});


export const gameState = atom({
  key: 'gameState',
  default: {
    started: false,
    round: 0,
    deck: [], // Include all cards
    playersData: {}, // To store player scores and submitted cards
    story: '',
    storyteller: null,
    storyCard: null,
    submittedCards: [],
    votes: {}
}
});

export const playerState = atom({
  key: 'playerState',
  default: {},
});

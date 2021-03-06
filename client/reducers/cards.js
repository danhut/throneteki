import _ from 'underscore';
import validateDeck from '../deck-validator.js';

function selectDeck(state, deck) {
    if(state.decks && state.decks.length !== 0) {
        state.selectedDeck = deck;
    } else {
        delete state.selectedDeck;
    }

    return state;
}

function processDecks(decks, state) {
    if(!decks) {
        return;
    }

    for(const deck of decks) {
        if(!state.cards || !deck.faction) {
            deck.status = {};
            return;
        }

        if(state.factions) {
            deck.faction = state.factions[deck.faction.value];
        }

        if(deck.agenda) {
            deck.agenda = state.agendas[deck.agenda.code];
        }

        if(deck.bannerCards) {
            deck.bannerCards = deck.bannerCards.map(card => state.cards[card.code]);
        }

        deck.plotCards = processCardCounts(deck.plotCards, state.cards);
        deck.drawCards = processCardCounts(deck.drawCards, state.cards);
        deck.rookeryCards = processCardCounts(deck.rookeryCards || [], state.cards);

        if(!state.restrictedList) {
            deck.status = {};
        } else {
            deck.status = validateDeck(deck, { packs: state.packs, restrictedList: state.restrictedList });
        }
    }
}

function processCardCounts(cardCounts, cardData) {
    let cardCountsWithData = cardCounts.map(cardCount => {
        return { count: cardCount.count, card: cardCount.card.custom ? cardCount.card : cardData[cardCount.card.code] };
    });

    // Filter out any cards that aren't available in the card data.
    return cardCountsWithData.filter(cardCount => !!cardCount.card);
}

export default function(state = {}, action) {
    let newState;
    switch(action.type) {
        case 'RECEIVE_CARDS':
            var agendas = {};

            _.each(action.response.cards, card => {
                if(card.type === 'agenda') {
                    agendas[card.code] = card;
                }
            });

            var banners = _.filter(agendas, card => {
                return card.label.startsWith('Banner of the');
            });

            newState = Object.assign({}, state, {
                cards: action.response.cards,
                agendas: agendas,
                banners: banners
            });

            // In case the card list is received after the decks, updated the decks now
            processDecks(newState.decks, newState);

            return newState;
        case 'RECEIVE_PACKS':
            return Object.assign({}, state, {
                packs: action.response.packs
            });
        case 'RECEIVE_FACTIONS':
            var factions = {};

            _.each(action.response.factions, faction => {
                factions[faction.value] = faction;
            });

            newState = Object.assign({}, state, {
                factions: factions
            });

            // In case the factions are received after the decks, updated the decks now
            processDecks(newState.decks, newState);

            return newState;
        case 'RECEIVE_RESTRICTED_LIST':
            newState = Object.assign({}, state, {
                restrictedList: action.response.restrictedList
            });

            // In case the restricted list is received after the decks, updated the decks now
            processDecks(newState.decks, newState);

            return newState;
        case 'RECEIVE_STANDALONE_DECKS':
            newState = Object.assign({}, state, {
                standaloneDecks: action.response.decks
            });

            processDecks(newState.standaloneDecks, newState);

            return newState;
        case 'ZOOM_CARD':
            return Object.assign({}, state, {
                zoomCard: action.card
            });
        case 'CLEAR_ZOOM':
            return Object.assign({}, state, {
                zoomCard: undefined
            });
        case 'RECEIVE_DECKS':
            processDecks(action.response.decks, state);
            newState = Object.assign({}, state, {
                singleDeck: false,
                decks: action.response.decks
            });

            newState = selectDeck(newState, newState.decks[0]);

            return newState;
        case 'REQUEST_DECK':
            return Object.assign({}, state, {
                deckSaved: false,
                deckDeleted: false
            });
        case 'REQUEST_DECKS':
            newState = Object.assign({}, state, {
                deckSaved: false,
                deckDeleted: false
            });

            if(newState.selectedDeck && !newState.selectedDeck._id) {
                if(_.size(newState.decks) > 0) {
                    newState.selectedDeck = newState.decks[0];
                }
            }

            return newState;
        case 'RECEIVE_DECK':
            newState = Object.assign({}, state, {
                singleDeck: true,
                deckSaved: false
            });

            processDecks([action.response.deck], state);

            newState.decks = _.map(state.decks, deck => {
                if(action.response.deck._id === deck.id) {
                    return deck;
                }

                return deck;
            });

            if(!_.any(newState.decks, deck => {
                return deck._id === action.response.deck._id;
            })) {
                newState.decks.push(action.response.deck);
            }

            var selected = _.find(newState.decks, deck => {
                return deck._id === action.response.deck._id;
            });

            newState = selectDeck(newState, selected);

            return newState;
        case 'SELECT_DECK':
            newState = Object.assign({}, state, {
                selectedDeck: action.deck,
                deckSaved: false
            });

            if(newState.selectedDeck) {
                processDecks([newState.selectedDeck], state);
            }

            return newState;
        case 'ADD_DECK':
            var newDeck = { name: 'New Deck', drawCards: [], plotCards: [] };

            newState = Object.assign({}, state, {
                selectedDeck: newDeck,
                deckSaved: false
            });

            processDecks([newState.selectedDeck], state);

            return newState;
        case 'UPDATE_DECK':
            newState = Object.assign({}, state, {
                selectedDeck: action.deck,
                deckSaved: false
            });

            if(newState.selectedDeck) {
                processDecks([newState.selectedDeck], state);
            }

            return newState;
        case 'SAVE_DECK':
            newState = Object.assign({}, state, {
                deckSaved: false
            });

            return newState;
        case 'DECK_SAVED':
            newState = Object.assign({}, state, {
                deckSaved: true,
                decks: undefined
            });

            return newState;
        case 'DECK_DELETED':
            newState = Object.assign({}, state, {
                deckDeleted: true
            });

            newState.decks = _.reject(newState.decks, deck => {
                return deck._id === action.response.deckId;
            });

            newState.selectedDeck = _.first(newState.decks);

            return newState;
        case 'CLEAR_DECK_STATUS':
            return Object.assign({}, state, {
                deckDeleted: false,
                deckSaved: false
            });
        default:
            return state;
    }
}

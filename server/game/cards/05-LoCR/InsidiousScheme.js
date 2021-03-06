const DrawCard = require('../../drawcard.js');

class InsidiousScheme extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            when: {
                onClaimApplied: event => (
                    event.challenge.challengeType === 'intrigue' &&
                    event.challenge.winner === this.controller &&
                    event.challenge.strengthDifference >= 5)
            },
            handler: context => {
                let opponent = context.event.challenge.loser;
                var cards = opponent.hand.length === 0 ? 4 : 2;
                cards = this.controller.drawCardsToHand(cards).length;
                this.game.addMessage('{0} plays {1} to draw {2} {3}',
                    this.controller, this, cards, cards > 1 ? 'cards' : 'card');
            }
        });
    }
}

InsidiousScheme.code = '05023';

module.exports = InsidiousScheme;

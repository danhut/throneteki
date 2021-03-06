const DrawCard = require('../../drawcard.js');
const ApplyClaim = require('../../gamesteps/challenge/applyclaim.js');

class MyaStone extends DrawCard {
    setupCardAbilities(ability) {
        this.interrupt({
            when: {
                onClaimApplied: event => (
                    ['military', 'intrigue'].includes(event.challenge.challengeType) &&
                    event.challenge.defendingPlayer === this.controller
                )
            },
            cost: ability.costs.kneelSelf(),
            handler: context => {
                this.game.addMessage('{0} kneels {1} to apply {2} claim instead of {3} claim',
                    context.player, this, 'power', context.event.challenge.challengeType);

                context.replaceHandler(() => {
                    let replacementChallenge = {
                        challengeType: 'power',
                        claim: context.event.challenge.winner.getClaim(),
                        loser: context.player,
                        winner: context.event.challenge.winner
                    };

                    this.game.queueStep(new ApplyClaim(this.game, replacementChallenge));
                });
            }
        });
    }
}

MyaStone.code = '08117';

module.exports = MyaStone;

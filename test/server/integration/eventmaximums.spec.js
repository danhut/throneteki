describe('event maximums', function() {
    integration(function() {
        beforeEach(function() {
            const deck = this.buildDeck('baratheon', [
                'A Game of Thrones', 'A Game of Thrones',
                'A Meager Contribution', 'A Meager Contribution'
            ]);
            this.player1.selectDeck(deck);
            this.player2.selectDeck(deck);
            this.startGame();
            this.skipSetupPhase();

            this.player1.selectPlot('A Game of Thrones');
            this.player2.selectPlot('A Game of Thrones');
            this.selectFirstPlayer(this.player2);
        });

        it('should not allow an event with a max to be prompted past the max', function() {
            this.player1.triggerAbility('A Meager Contribution');

            expect(this.player1).not.toAllowAbilityTrigger('A Meager Contribution');
        });

        it('should allow other players to play the event even if it reaches a maximum with another player', function() {
            this.player1.triggerAbility('A Meager Contribution');

            // Complete marshaling
            this.player2.clickPrompt('Done');

            expect(this.player2).toAllowAbilityTrigger('A Meager Contribution');
        });

        describe('when the maximum period has passed', function() {
            beforeEach(function() {
                // Play the card Round 1
                this.player1.triggerAbility('A Meager Contribution');
                this.player2.clickPrompt('Done');
                this.player2.clickPrompt('Pass');
                this.player1.clickPrompt('Done');

                this.completeChallengesPhase();

                this.selectFirstPlayer(this.player2);
            });

            it('should allow the card to be prompted again', function() {
                expect(this.player1).toAllowAbilityTrigger('A Meager Contribution');
            });
        });
    });
});

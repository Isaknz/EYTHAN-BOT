const games = new Map();

const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    return suits.flatMap(suit => values.map(value => ({ suit, value })));
}

function draw(game) {
    const index = Math.floor(Math.random() * game.deck.length);
    return game.deck.splice(index, 1)[0];
}

function handValue(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.value === 'A') {
            total += 11;
            aces++;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            total += 10;
        } else {
            total += Number(card.value);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function formatHand(hand) {
    return hand.map(card => `${card.value}${card.suit}`).join('  ');
}

function finish(key, game, message) {
    games.delete(key);
    return message;
}

module.exports = {
    name: 'blackjack',
    aliases: ['21', 'veintiuno'],
    description: 'Juega blackjack contra el dealer',

    async execute(sock, message, args, { from, sender }) {
        const key = `${from}:${sender}`;
        const action = args[0]?.toLowerCase();

        if (!action || action === 'nuevo' || action === 'new') {
            if (games.has(key)) {
                return sock.sendMessage(from, { text: '🃏 Ya tienes una partida. Usa *.blackjack carta* o *.blackjack plantarse*.' });
            }

            const game = { deck: createDeck(), player: [], dealer: [] };
            game.player.push(draw(game), draw(game));
            game.dealer.push(draw(game), draw(game));
            games.set(key, game);

            const value = handValue(game.player);
            if (value === 21) {
                return sock.sendMessage(from, {
                    text: finish(key, game, `🃏 *Blackjack natural*\n\nTus cartas: ${formatHand(game.player)}\nValor: *21*\n\n🎉 ¡Ganaste!`)
                });
            }

            return sock.sendMessage(from, {
                text: `🃏 *Blackjack*\n\nTus cartas: ${formatHand(game.player)}\nValor: *${value}*\n\nCarta visible del dealer: ${formatHand([game.dealer[0]])}\n\nUsa *.blackjack carta* o *.blackjack plantarse*.`
            });
        }

        const game = games.get(key);
        if (!game) {
            return sock.sendMessage(from, { text: '🃏 No tienes una partida activa. Usa *.blackjack* para comenzar.' });
        }

        if (action === 'carta' || action === 'hit') {
            game.player.push(draw(game));
            const value = handValue(game.player);

            if (value > 21) {
                return sock.sendMessage(from, {
                    text: finish(key, game, `💥 *Te pasaste*\n\nTus cartas: ${formatHand(game.player)}\nValor: *${value}*\n\nGanó el dealer.`)
                });
            }

            return sock.sendMessage(from, {
                text: `🃏 Robaste: *${formatHand([game.player.at(-1)])}*\n\nTus cartas: ${formatHand(game.player)}\nValor: *${value}*\n\nUsa *.blackjack carta* o *.blackjack plantarse*.`
            });
        }

        if (action === 'plantarse' || action === 'plantar' || action === 'stand') {
            while (handValue(game.dealer) < 17) game.dealer.push(draw(game));

            const playerValue = handValue(game.player);
            const dealerValue = handValue(game.dealer);
            const result = playerValue > dealerValue || dealerValue > 21
                ? '🎉 ¡Ganaste!'
                : playerValue === dealerValue ? '🤝 Empate.' : '😅 Ganó el dealer.';

            return sock.sendMessage(from, {
                text: finish(key, game, `🃏 *Resultado*\n\nTus cartas: ${formatHand(game.player)} (${playerValue})\nDealer: ${formatHand(game.dealer)} (${dealerValue})\n\n${result}`)
            });
        }

        return sock.sendMessage(from, { text: '🃏 Usa *.blackjack carta* o *.blackjack plantarse*.' });
    }
};
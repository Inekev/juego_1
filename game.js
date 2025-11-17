// ============================================
// GAME CONFIGURATION & STATE
// ============================================

// Game Configuration
let gameConfig = {
    playerCount: 0,
    players: []
};

// Player colors for avatars
const playerColors = [
    { bg: 'bg-blue-500', ring: 'ring-blue-500' },
    { bg: 'bg-pink-500', ring: 'ring-pink-500' },
    { bg: 'bg-green-500', ring: 'ring-green-500' },
    { bg: 'bg-purple-500', ring: 'ring-purple-500' },
    { bg: 'bg-orange-500', ring: 'ring-orange-500' }
];

// Game State
let gameState = {
    currentPlayerIndex: 0,
    currentRound: 1,
    dice: [1, 1, 1, 1, 1],
    locked: [false, false, false, false, false],
    rollsLeft: 3,
    players: []
};

// Score Categories Configuration
const categories = {
    upper: [
        { id: 'ones', name: 'Unos', value: 1 },
        { id: 'twos', name: 'Doses', value: 2 },
        { id: 'threes', name: 'Treses', value: 3 },
        { id: 'fours', name: 'Cuatros', value: 4 },
        { id: 'fives', name: 'Cincos', value: 5 },
        { id: 'sixes', name: 'Seises', value: 6 }
    ],
    lower: [
        { id: 'threeOfKind', name: 'Trío', points: 'Suma' },
        { id: 'fourOfKind', name: 'Poker', points: 'Suma' },
        { id: 'fullHouse', name: 'Full', points: '25' },
        { id: 'smallStraight', name: 'Esc. Menor', points: '30' },
        { id: 'largeStraight', name: 'Esc. Mayor', points: '40' },
        { id: 'yahtzee', name: 'Yahtzee', points: '50' },
        { id: 'chance', name: 'Suerte', points: 'Suma' }
    ]
};

// ============================================
// SETUP FUNCTIONS
// ============================================

function selectPlayerCount(count) {
    gameConfig.playerCount = count;

    // Highlight selected button
    document.querySelectorAll('.player-select-btn').forEach(btn => {
        btn.classList.remove('bg-gray-900', 'text-white', 'border-gray-900');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    event.target.classList.remove('bg-gray-100', 'text-gray-700');
    event.target.classList.add('bg-gray-900', 'text-white');

    // Show player name inputs
    const container = document.getElementById('playerNamesContainer');
    const inputsContainer = document.getElementById('playerNameInputs');
    inputsContainer.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'flex items-center gap-3';
        inputDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full ${playerColors[i].bg} flex items-center justify-center text-white font-semibold text-sm">
                ${i + 1}
            </div>
            <input type="text" id="player${i}Name" placeholder="Jugador ${i + 1}"
                   class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 focus:outline-none transition-all"
                   value="Jugador ${i + 1}">
        `;
        inputsContainer.appendChild(inputDiv);
    }

    container.classList.remove('hidden');
    document.getElementById('startGameBtn').classList.remove('hidden');
}

function startGame() {
    // Get player names
    gameConfig.players = [];
    for (let i = 0; i < gameConfig.playerCount; i++) {
        const name = document.getElementById(`player${i}Name`).value.trim() || `Jugador ${i + 1}`;
        gameConfig.players.push({
            name: name,
            colorIndex: i
        });
    }

    // Initialize game state
    gameState.players = gameConfig.players.map(p => ({
        name: p.name,
        colorIndex: p.colorIndex,
        scores: {
            ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
            threeOfKind: null, fourOfKind: null, fullHouse: null,
            smallStraight: null, largeStraight: null, yahtzee: null, chance: null
        }
    }));

    gameState.currentPlayerIndex = 0;
    gameState.currentRound = 1;
    gameState.dice = [1, 1, 1, 1, 1];
    gameState.locked = [false, false, false, false, false];
    gameState.rollsLeft = 3;

    // Switch screens
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    // Initialize game UI
    initGameUI();
}

function backToSetup() {
    if (confirm('¿Volver al menú? Se perderá el progreso actual.')) {
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('setupScreen').classList.remove('hidden');

        // Reset
        gameConfig = { playerCount: 0, players: [] };
        document.getElementById('playerNamesContainer').classList.add('hidden');
        document.getElementById('startGameBtn').classList.add('hidden');
        document.querySelectorAll('.player-select-btn').forEach(btn => {
            btn.classList.remove('bg-gray-900', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        });
    }
}

// ============================================
// UI INITIALIZATION
// ============================================

function initGameUI() {
    createDice();
    createScoreTable();
    createPlayersList();
    updateDisplay();
}

function createDice() {
    const container = document.getElementById('diceContainer');
    container.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const die = document.createElement('div');
        die.className = 'die bg-white rounded-xl w-16 h-16 flex items-center justify-center text-3xl cursor-pointer select-none';
        die.id = `die${i}`;
        die.textContent = '⚀';
        die.onclick = () => toggleLock(i);
        container.appendChild(die);
    }
}

function createScoreTable() {
    // Upper Section
    const upperSection = document.getElementById('upperSection');
    upperSection.innerHTML = '';
    categories.upper.forEach(cat => {
        const row = createScoreRow(cat.id, cat.name);
        upperSection.appendChild(row);
    });

    // Lower Section
    const lowerSection = document.getElementById('lowerSection');
    lowerSection.innerHTML = '';
    categories.lower.forEach(cat => {
        const row = createScoreRow(cat.id, cat.name);
        lowerSection.appendChild(row);
    });
}

function createScoreRow(id, name) {
    const row = document.createElement('div');
    row.className = 'score-cell flex justify-between items-center px-3 py-2 rounded-lg text-sm';
    row.id = `row-${id}`;
    row.innerHTML = `
        <span class="font-medium text-gray-700">${name}</span>
        <span class="font-semibold text-gray-900" id="score-${id}">-</span>
    `;
    row.onclick = () => selectScore(id);
    return row;
}

function createPlayersList() {
    const container = document.getElementById('playersList');
    container.innerHTML = '';

    gameState.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.id = `player-card-${index}`;
        playerCard.className = 'player-card p-3 rounded-lg border-2 border-transparent transition-all';

        const total = calculatePlayerTotal(player);
        const completedCategories = Object.values(player.scores).filter(s => s !== null).length;

        playerCard.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${playerColors[player.colorIndex].bg} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    ${player.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 text-sm truncate">${player.name}</p>
                    <p class="text-xs text-gray-500">${completedCategories}/13 • ${total} pts</p>
                </div>
            </div>
        `;

        container.appendChild(playerCard);
    });

    updateActivePlayer();
}

function updateActivePlayer() {
    gameState.players.forEach((player, index) => {
        const card = document.getElementById(`player-card-${index}`);
        if (index === gameState.currentPlayerIndex) {
            card.classList.add('active', 'border-gray-900', 'bg-gray-50');
        } else {
            card.classList.remove('active', 'border-gray-900', 'bg-gray-50');
        }
    });
}

// ============================================
// GAME LOGIC - DICE
// ============================================

function toggleLock(index) {
    if (gameState.rollsLeft < 3) {
        gameState.locked[index] = !gameState.locked[index];
        updateDiceDisplay();
    }
}

function rollDice() {
    if (gameState.rollsLeft === 0) return;

    // Animate and roll unlocked dice
    for (let i = 0; i < 5; i++) {
        if (!gameState.locked[i]) {
            const die = document.getElementById(`die${i}`);
            die.classList.add('rolling');
            setTimeout(() => die.classList.remove('rolling'), 600);
            gameState.dice[i] = Math.floor(Math.random() * 6) + 1;
        }
    }

    gameState.rollsLeft--;
    updateDisplay();
    updatePossibleScores();
}

function updateDiceDisplay() {
    const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    for (let i = 0; i < 5; i++) {
        const die = document.getElementById(`die${i}`);
        die.textContent = diceSymbols[gameState.dice[i] - 1];

        if (gameState.locked[i]) {
            die.classList.add('locked');
        } else {
            die.classList.remove('locked');
        }
    }
}

// ============================================
// GAME LOGIC - SCORING
// ============================================

function selectScore(category) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.scores[category] !== null) return;
    if (gameState.rollsLeft === 3) return;

    const scoreElement = document.getElementById(`score-${category}`);
    const score = parseInt(scoreElement.textContent) || 0;

    currentPlayer.scores[category] = score;
    scoreElement.textContent = score;

    const row = document.getElementById(`row-${category}`);
    row.classList.add('used');

    updateTotalScores();

    // Update players list immediately
    createPlayersList();

    // Move to next turn after a short delay
    setTimeout(() => {
        nextTurn();
    }, 300);
}

function updatePossibleScores() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const dice = gameState.dice;

    // Count occurrences
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);

    // Update each category
    categories.upper.forEach(cat => {
        if (currentPlayer.scores[cat.id] === null) {
            const score = (counts[cat.value] || 0) * cat.value;
            document.getElementById(`score-${cat.id}`).textContent = score;
        }
    });

    // Lower section
    if (currentPlayer.scores.threeOfKind === null) {
        const score = hasNOfKind(3) ? sumDice() : 0;
        document.getElementById('score-threeOfKind').textContent = score;
    }

    if (currentPlayer.scores.fourOfKind === null) {
        const score = hasNOfKind(4) ? sumDice() : 0;
        document.getElementById('score-fourOfKind').textContent = score;
    }

    if (currentPlayer.scores.fullHouse === null) {
        const score = isFullHouse() ? 25 : 0;
        document.getElementById('score-fullHouse').textContent = score;
    }

    if (currentPlayer.scores.smallStraight === null) {
        const score = isSmallStraight() ? 30 : 0;
        document.getElementById('score-smallStraight').textContent = score;
    }

    if (currentPlayer.scores.largeStraight === null) {
        const score = isLargeStraight() ? 40 : 0;
        document.getElementById('score-largeStraight').textContent = score;
    }

    if (currentPlayer.scores.yahtzee === null) {
        const score = hasNOfKind(5) ? 50 : 0;
        document.getElementById('score-yahtzee').textContent = score;
    }

    if (currentPlayer.scores.chance === null) {
        document.getElementById('score-chance').textContent = sumDice();
    }
}

// Scoring Helper Functions
function sumDice() {
    return gameState.dice.reduce((a, b) => a + b, 0);
}

function hasNOfKind(n) {
    const counts = {};
    gameState.dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
    return Object.values(counts).some(count => count >= n);
}

function isFullHouse() {
    const counts = {};
    gameState.dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
    const values = Object.values(counts).sort();
    return values.length === 2 && values[0] === 2 && values[1] === 3;
}

function isSmallStraight() {
    const unique = [...new Set(gameState.dice)].sort();
    const straights = [[1,2,3,4], [2,3,4,5], [3,4,5,6]];
    return straights.some(straight =>
        straight.every(num => unique.includes(num))
    );
}

function isLargeStraight() {
    const sorted = [...gameState.dice].sort().join('');
    return sorted === '12345' || sorted === '23456';
}

function calculatePlayerTotal(player) {
    let upperSum = 0;
    categories.upper.forEach(cat => {
        if (player.scores[cat.id] !== null) {
            upperSum += player.scores[cat.id];
        }
    });

    const bonus = upperSum >= 63 ? 35 : 0;
    const upperTotal = upperSum + bonus;

    let lowerSum = 0;
    categories.lower.forEach(cat => {
        if (player.scores[cat.id] !== null) {
            lowerSum += player.scores[cat.id];
        }
    });

    return upperTotal + lowerSum;
}

// ============================================
// GAME LOGIC - TURNS & ROUNDS
// ============================================

function nextTurn() {
    // Move to next player
    gameState.currentPlayerIndex++;

    // Check if we've cycled through all players
    if (gameState.currentPlayerIndex >= gameState.players.length) {
        gameState.currentPlayerIndex = 0;
        gameState.currentRound++;

        // Check if game is over (all players completed all categories)
        const allPlayersFinished = gameState.players.every(player =>
            Object.values(player.scores).every(score => score !== null)
        );

        if (allPlayersFinished) {
            endGame();
            return;
        }
    }

    // Reset for next turn
    gameState.rollsLeft = 3;
    gameState.locked = [false, false, false, false, false];
    gameState.dice = [1, 1, 1, 1, 1];

    updateDisplay();
    loadPlayerScores();
    clearPossibleScores();
}

function loadPlayerScores() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    Object.keys(currentPlayer.scores).forEach(key => {
        const scoreElement = document.getElementById(`score-${key}`);
        const row = document.getElementById(`row-${key}`);

        if (currentPlayer.scores[key] !== null) {
            scoreElement.textContent = currentPlayer.scores[key];
            row.classList.add('used');
        } else {
            scoreElement.textContent = '-';
            row.classList.remove('used');
        }
    });

    updateTotalScores();
}

function clearPossibleScores() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    Object.keys(currentPlayer.scores).forEach(key => {
        if (currentPlayer.scores[key] === null) {
            document.getElementById(`score-${key}`).textContent = '-';
        }
    });
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateDisplay() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('currentPlayerName').textContent = currentPlayer.name;
    document.getElementById('rollsLeft').textContent = gameState.rollsLeft;

    updateDiceDisplay();
    updateTotalScores();
    updateActivePlayer();
}

function updateTotalScores() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Upper section
    let upperSum = 0;
    categories.upper.forEach(cat => {
        if (currentPlayer.scores[cat.id] !== null) {
            upperSum += currentPlayer.scores[cat.id];
        }
    });
    document.getElementById('upperSubtotal').textContent = upperSum;

    // Bonus
    const bonus = upperSum >= 63 ? 35 : 0;
    document.getElementById('bonusScore').textContent = bonus;

    const upperTotal = upperSum + bonus;
    document.getElementById('upperTotal').textContent = upperTotal;

    // Lower section
    let lowerSum = 0;
    categories.lower.forEach(cat => {
        if (currentPlayer.scores[cat.id] !== null) {
            lowerSum += currentPlayer.scores[cat.id];
        }
    });
    document.getElementById('lowerTotal').textContent = lowerSum;

    // Grand total
    const grandTotal = upperTotal + lowerSum;
    document.getElementById('grandTotal').textContent = grandTotal;
    document.getElementById('currentScore').textContent = grandTotal;
}

// ============================================
// SCOREBOARD MODAL
// ============================================

function showScoreboard() {
    const modal = document.getElementById('scoreboardModal');
    const content = document.getElementById('scoreboardContent');

    let html = '<table class="w-full border-collapse text-sm">';
    html += '<thead><tr class="border-b-2 border-gray-900">';
    html += '<th class="p-3 text-left font-semibold text-gray-900">Categoría</th>';

    gameState.players.forEach((player) => {
        html += `<th class="p-3 text-center font-semibold text-gray-900">${player.name}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Upper section
    html += '<tr class="bg-gray-100"><td colspan="' + (gameState.players.length + 1) + '" class="p-2 font-semibold text-xs uppercase tracking-wide text-gray-700">Sección Superior</td></tr>';
    categories.upper.forEach(cat => {
        html += '<tr class="border-b border-gray-200">';
        html += `<td class="p-2 text-gray-700">${cat.name}</td>`;
        gameState.players.forEach(player => {
            const score = player.scores[cat.id];
            html += `<td class="p-2 text-center font-medium">${score !== null ? score : '-'}</td>`;
        });
        html += '</tr>';
    });

    // Upper totals
    html += '<tr class="bg-gray-50"><td class="p-2 text-gray-600 text-xs">Bonus (63+)</td>';
    gameState.players.forEach(player => {
        let upperSum = 0;
        categories.upper.forEach(cat => {
            if (player.scores[cat.id] !== null) upperSum += player.scores[cat.id];
        });
        const bonus = upperSum >= 63 ? 35 : 0;
        html += `<td class="p-2 text-center font-medium text-green-600">${bonus}</td>`;
    });
    html += '</tr>';

    // Lower section
    html += '<tr class="bg-gray-100"><td colspan="' + (gameState.players.length + 1) + '" class="p-2 font-semibold text-xs uppercase tracking-wide text-gray-700">Sección Inferior</td></tr>';
    categories.lower.forEach(cat => {
        html += '<tr class="border-b border-gray-200">';
        html += `<td class="p-2 text-gray-700">${cat.name}</td>`;
        gameState.players.forEach(player => {
            const score = player.scores[cat.id];
            html += `<td class="p-2 text-center font-medium">${score !== null ? score : '-'}</td>`;
        });
        html += '</tr>';
    });

    // Grand totals
    html += '<tr class="bg-gray-900 text-white font-bold"><td class="p-3">TOTAL FINAL</td>';
    gameState.players.forEach(player => {
        const total = calculatePlayerTotal(player);
        html += `<td class="p-3 text-center text-lg">${total}</td>`;
    });
    html += '</tr>';

    html += '</tbody></table>';
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function hideScoreboard() {
    document.getElementById('scoreboardModal').classList.add('hidden');
}

// ============================================
// GAME END
// ============================================

function endGame() {
    const results = gameState.players.map(player => ({
        name: player.name,
        total: calculatePlayerTotal(player),
        colorIndex: player.colorIndex
    }));

    results.sort((a, b) => b.total - a.total);

    let message = '🎉 Juego Terminado 🎉\n\n';
    message += 'RANKING FINAL:\n\n';

    results.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        message += `${medal} ${index + 1}. ${player.name}: ${player.total} puntos\n`;
    });

    message += `\n¡Felicidades ${results[0].name}!`;

    setTimeout(() => {
        alert(message);
        showScoreboard();
    }, 500);
}
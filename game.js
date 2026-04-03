(() => {
  const board = document.getElementById('game-board');
  const moveCounterEl = document.getElementById('move-counter');
  const timerEl = document.getElementById('timer');
  const victoryOverlay = document.getElementById('victory-overlay');
  const victoryStats = document.getElementById('victory-stats');
  const victoryFact = document.getElementById('victory-fact');

  const state = {
    cards: [],
    flipped: [],
    matchedPairs: 0,
    totalPairs: CARD_PAIRS.length,
    moves: 0,
    locked: false,
    timerStarted: false,
    startTime: null,
    timerInterval: null,
  };

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildCards() {
    const cards = [];
    CARD_PAIRS.forEach((pair) => {
      cards.push({
        id: `${pair.pairId}-animal`,
        pairId: pair.pairId,
        type: 'animal',
        label: pair.animal.label,
        image: pair.animal.image,
      });
      cards.push({
        id: `${pair.pairId}-part`,
        pairId: pair.pairId,
        type: 'part',
        label: pair.part.label,
        image: pair.part.image,
      });
    });
    return shuffle(cards);
  }

  function createCardEl(card) {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = card.id;
    el.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="card-front-pattern">
            <img src="${CARD_BACK_IMAGE}" alt="Card" draggable="false">
          </div>
        </div>
        <div class="card-face card-back">
          <img src="${card.image}" alt="${card.label}" draggable="false">
          <span class="card-label">${card.label}</span>
        </div>
      </div>
    `;
    el.addEventListener('click', () => handleCardClick(card, el));
    return el;
  }

  function render() {
    board.innerHTML = '';
    state.cards.forEach((card) => {
      board.appendChild(createCardEl(card));
    });
  }

  function handleCardClick(card, el) {
    if (state.locked) return;
    if (el.classList.contains('flipped')) return;
    if (el.classList.contains('matched')) return;

    if (!state.timerStarted) {
      startTimer();
      state.timerStarted = true;
    }

    el.classList.add('flipped');
    state.flipped.push({ card, el });

    if (state.flipped.length === 2) {
      state.moves++;
      moveCounterEl.textContent = state.moves;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = state.flipped;
    const isMatch = a.card.pairId === b.card.pairId && a.card.type !== b.card.type;

    if (isMatch) {
      a.el.classList.add('matched');
      b.el.classList.add('matched');
      state.matchedPairs++;
      state.flipped = [];

      if (state.matchedPairs === state.totalPairs) {
        setTimeout(showVictory, 600);
      }
    } else {
      state.locked = true;
      a.el.classList.add('no-match');
      b.el.classList.add('no-match');

      setTimeout(() => {
        a.el.classList.remove('flipped', 'no-match');
        b.el.classList.remove('flipped', 'no-match');
        state.flipped = [];
        state.locked = false;
      }, 1000);
    }
  }

  function startTimer() {
    state.startTime = Date.now();
    state.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 250);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  function getElapsedTime() {
    if (!state.startTime) return '0:00';
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function showVictory() {
    stopTimer();
    const time = getElapsedTime();
    victoryStats.textContent = `${state.moves} moves in ${time}`;

    const randomPair = CARD_PAIRS[Math.floor(Math.random() * CARD_PAIRS.length)];
    victoryFact.textContent = randomPair.funFact;

    victoryOverlay.classList.add('visible');
  }

  function resetGame() {
    stopTimer();
    victoryOverlay.classList.remove('visible');
    state.cards = buildCards();
    state.flipped = [];
    state.matchedPairs = 0;
    state.moves = 0;
    state.locked = false;
    state.timerStarted = false;
    state.startTime = null;
    moveCounterEl.textContent = '0';
    timerEl.textContent = '0:00';
    render();
  }

  document.getElementById('btn-new-game').addEventListener('click', resetGame);
  document.getElementById('btn-play-again').addEventListener('click', resetGame);

  // Init
  state.cards = buildCards();
  render();
})();

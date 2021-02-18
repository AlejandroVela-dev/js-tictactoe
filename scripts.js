'use strict';

/* TO DO
  - AI Research:
    -- Minimax algorithm
    -- Optimal % of perfect move for each difficulty level
    -- Optimal UI/UX delay response when UI making move

  - Refactor && Re-arrange code
  - Comment not-straightforward code blocks
*/

// PLAYERS INITIALIZATION
let playerOne;
let playerTwo;

// DISPLAY CONTROLLER MODULE
const displayController = (() => {
  let gameMode;
  let aiDifficulty = 'easy';
  const getGameMode = () => gameMode;

  // UI - PLAYERS ATTRIBUTES
  const cssRoot = getComputedStyle(document.documentElement);
  const playerOneColor = cssRoot.getPropertyValue('--player1');
  const playerOneSymbol = 'svg/cross.svg';
  const playerTwoPicture = 'svg/player-alt.svg';
  const playerTwoColor = cssRoot.getPropertyValue('--player2');
  const playerTwoSymbol = 'svg/circle-blue.svg';
  const robotPicture = 'svg/robot.svg';
  const robotColor = cssRoot.getPropertyValue('--robot');
  const robotSymbol = 'svg/circle-red.svg';

  // UI ELEMENTS - SCREEN NAVIGATION
  const gameScreens = document.querySelectorAll('.game');
  const navigationBtns = document.querySelectorAll('.navigation');

  // UI ELEMENTS - GAME SELECT
  const playerOneInput = document.querySelector('#player-1');
  const playerTwoInput = document.querySelector('#player-2');
  const enemyPicture = document.querySelectorAll('.enemy-picture');
  const enemySymbol = document.querySelector('.enemy-symbol');
  const enemyColor = document.querySelectorAll('.score-p2');
  const enemyAIDifficultyBtn = document.querySelectorAll('.diff-ai');

  // UI ELEMENTS - GAME BOARD
  const boardPlayerCards = document.querySelectorAll('.player-card');
  const boardPlayerOneCard = document.querySelectorAll('.card-p1');
  const boardPlayerOneName = document.querySelector('.player-info__name-1');
  const boardPlayerOneScore = document.querySelectorAll('.score-p1__points');
  const boardPlayerTwoCard = document.querySelectorAll('.card-p2');
  const boardPlayerTwoName = document.querySelector('.player-info__name-2');
  const boardPlayerTwoScore = document.querySelectorAll('.score-p2__points');
  const boardDifficultyInfo = document.querySelector('.player-info__diff-ai');
  const boardBoxes = document.querySelectorAll('.board__box');
  const boardRoundResult = document.querySelector('.match-result');
  const boardRoundResultWinner = document.querySelector('.result--winner');
  const boardRoundResultText = document.querySelector('.result--text');
  const boardNextRoundBtn = document.querySelector('.controls__next-round');
  const boardResetScoreBtn = document.querySelector('.controls__reset-score');

  // METHODS - SCREEN NAVIGATION
  const navigageTo = (screen) => {
    prepareScreen(screen);
    hideAllScreens();
    showScreen(screen);
  };

  navigationBtns.forEach((x) => {
    x.addEventListener('click', () => {
      const screen = x.dataset.destination;
      navigageTo(screen);
    });
  });

  const prepareScreen = (screen) => {
    switch (screen) {
      case 'game--menu':
        gameBoard.resetGame();
        break;

      case 'game--pvp':
        fillEnemyAttributes(playerTwoPicture, playerTwoColor, playerTwoSymbol);
        gameMode = 'pvp';
        break;

      case 'game--pve':
        fillEnemyAttributes(robotPicture, robotColor, robotSymbol);
        gameMode = 'pve';
        break;

      case 'game--board':
        createPlayers();
        refreshScores();
        animateCurrentTurn(gameBoard.getCurrentTurnSymbol());
        fillBoardCards();
        break;

      default:
        break;
    }
  };

  const hideAllScreens = () => {
    gameScreens.forEach((x) => (x.style.display = 'none'));
  };

  const showScreen = (screen) => {
    const destinationScreen = document.querySelector(`.${screen}`);
    destinationScreen.style.display = 'grid';
  };

  // METHODS - GAME SELECT
  const fillEnemyAttributes = (picture, color, symbol) => {
    enemyPicture.forEach((x) => (x.src = picture));
    enemyColor.forEach((x) => (x.style.color = color));
    enemySymbol.src = symbol;
  };

  const setDifficultyBtn = (button) => {
    button.classList.add('current-difficulty');
    button.classList.remove('animate-bob', 'animate-grayscale');
  };

  const unsetDifficultyBtn = (button) => {
    button.classList.add('animate-bob', 'animate-grayscale');
    button.classList.remove('current-difficulty');
  };

  enemyAIDifficultyBtn.forEach((x) =>
    x.addEventListener('click', () => {
      const activeBtn = document.querySelector('.current-difficulty');
      if (activeBtn) {
        unsetDifficultyBtn(activeBtn);
      }
      setDifficultyBtn(x);
      aiDifficulty = x.textContent.trim();
    })
  );

  // METHODS - PLAYERS FACTORY EXECUTION
  const createPlayers = () => {
    switch (gameMode) {
      case 'pvp':
        createPvpPlayers();
        break;

      case 'pve':
        createPvePlayers();
        break;

      default:
        break;
    }
  };

  const createPvpPlayers = () => {
    const playerOneName = playerOneInput.value
      ? playerOneInput.value
      : 'Player 1';
    const playerTwoName = playerTwoInput.value
      ? playerTwoInput.value
      : 'Player 2';
    playerOne = Player(playerOneName, 'x');
    playerTwo = Player(playerTwoName, 'o');
  };

  const createPvePlayers = () => {
    playerOne = Player('Human', 'x');
    playerTwo = Player('Robot', 'o', aiDifficulty);
  };

  // METHODS - GAME BOARD
  const fillBoardCards = () => {
    switch (gameMode) {
      case 'pvp':
        boardPlayerOneName.textContent = playerOne.getName();
        boardPlayerTwoName.textContent = playerTwo.getName();
        boardDifficultyInfo.style.display = 'none';
        break;

      case 'pve':
        boardPlayerOneName.textContent = playerOne.getName();
        boardPlayerTwoName.textContent = '';
        boardDifficultyInfo.textContent = aiDifficulty;
        boardDifficultyInfo.classList.add(aiDifficulty);
        boardDifficultyInfo.style.display = 'flex';
        break;

      default:
        break;
    }
  };

  const fillBoardBox = (index, playerOneTurn) => {
    const box = document.querySelector(`[data-index='${index}']`)
      .firstElementChild;
    const symbol = playerOneTurn ? playerOneSymbol : enemySymbol.src;
    box.src = symbol;
  };

  boardBoxes.forEach((x) => {
    x.addEventListener('click', (box) => {
      const boxIndex = box.currentTarget.dataset.index;
      gameBoard.makeMove(boxIndex);
    });
  });

  const showRoundResult = (winner) => {
    switch (winner) {
      case 'x':
        setRoundResultMsg(playerOne.getName(), 'Wins!', playerOneColor);
        break;

      case 'o':
        setRoundResultMsg(
          playerTwo.getName(),
          'Wins!',
          enemyColor[0].style.color
        );
        break;

      default:
        setRoundResultMsg('', `It's a tie!`);
        break;
    }
    toogleRoundResult('flex');
  };

  const setRoundResultMsg = (winner, text, color = '') => {
    boardRoundResultWinner.innerText = winner;
    boardRoundResultText.innerText = text;
    boardRoundResultWinner.style.color = color;
  };

  const toogleRoundResult = (displayValue) => {
    boardRoundResult.style.display = displayValue;
    boardNextRoundBtn.style.display = displayValue;
    boardResetScoreBtn.style.display = displayValue;
  };

  const animateCurrentTurn = (currentSymbol) => {
    boardPlayerCards.forEach((card) =>
      card.classList.remove('animate-bob-turn')
    );

    switch (currentSymbol) {
      case 'x':
        boardPlayerOneCard.forEach((card) =>
          card.classList.add('animate-bob-turn')
        );
        break;

      case 'o':
        boardPlayerTwoCard.forEach((card) =>
          card.classList.add('animate-bob-turn')
        );
        break;

      default:
        break;
    }
  };

  // METHODS - GAME UTILITIES
  boardNextRoundBtn.addEventListener('click', () => gameBoard.resetTurn());
  boardResetScoreBtn.addEventListener('click', () => {
    playerOne.resetScore();
    playerTwo.resetScore();
  });

  const refreshScores = () => {
    boardPlayerOneScore.forEach(
      (score) => (score.innerText = playerOne.getScore())
    );
    boardPlayerTwoScore.forEach(
      (score) => (score.innerText = playerTwo.getScore())
    );
  };

  const resetBoard = () => {
    boardBoxes.forEach((box) => (box.firstElementChild.src = ''));
    toogleRoundResult('none');
  };

  const resetTurn = () => {
    resetBoard();
    animateCurrentTurn(gameBoard.getCurrentTurnSymbol());
  };

  const resetGame = () => {
    resetBoard();
    playerOneInput.value = '';
    playerTwoInput.value = '';
    boardDifficultyInfo.classList.remove(aiDifficulty);
  };

  // PUBLIC
  return {
    getGameMode,
    animateCurrentTurn,
    fillBoardBox,
    showRoundResult,
    refreshScores,
    resetTurn,
    resetGame,
  };
})();

// PLAYER FACTORY
const Player = (name, symbol, difficulty) => {
  let score = 0;
  const getName = () => name;
  const getSymbol = () => symbol;
  const setDifficulty = (x) => (difficulty = x);
  const getDifficulty = () => difficulty;
  const getScore = () => score;
  const resetScore = () => {
    score = 0;
    displayController.refreshScores();
  };
  const winRound = () => {
    score += 1;
    displayController.refreshScores();
  };

  // PUBLIC
  return {
    getName,
    getSymbol,
    setDifficulty,
    getDifficulty,
    getScore,
    resetScore,
    winRound,
  };
};

// BOARD MODULE
const gameBoard = (() => {
  let boardArray = [];
  let moveCount = 0;
  let playerOneStarts = true; // Allows initial turn-order every round
  let playerOneTurn = true; // Allows turn-order inside round
  const winningPatterns = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const changeTurn = () => {
    playerOneTurn = !playerOneTurn;
  };

  const resetGame = () => {
    boardArray.length = 0;
    moveCount = 0;
    playerOneStarts = true;
    playerOneTurn = true;
    playerOne = undefined;
    playerTwo = undefined;
    displayController.resetGame();
  };

  const resetTurn = () => {
    boardArray.length = 0;
    moveCount = 0;
    playerOneStarts = !playerOneStarts;
    playerOneTurn = playerOneStarts;
    displayController.resetTurn();

    checkAndExecuteRobotTurn();
  };

  const getCurrentTurnSymbol = () => {
    return playerOneTurn ? 'x' : 'o';
  };

  const fillBoardArray = (boxIndex) => {
    boardArray[boxIndex] = getCurrentTurnSymbol();
  };

  const isMoveLegal = (boxIndex) => {
    return boardArray[boxIndex] === undefined;
  };

  const makeMove = (boxIndex) => {
    let roundEnd = false; // Holds roundResult answer to enable turns change
    if (isMoveLegal(boxIndex)) {
      fillBoardArray(boxIndex);
      displayController.fillBoardBox(boxIndex, playerOneTurn);
      moveCount++;
      // Only check results after 4th movement
      if (moveCount >= 5) {
        roundEnd = checkRoundResult(getCurrentTurnSymbol());
      }
      // If no win or tie, game continues, change turn
      if (!roundEnd) {
        changeTurn();
        displayController.animateCurrentTurn(getCurrentTurnSymbol());
        checkAndExecuteRobotTurn();
      }
    } else return;
  };

  const checkAndExecuteRobotTurn = () => {
    if (!playerOneTurn && displayController.getGameMode() === 'pve')
      setTimeout(minimaxAI.makeRandomMove, 750);
  };

  const checkRoundResult = (currentSymbol) => {
    const win = winningPatterns.some((winningPattern) => {
      // Check and return true when first pattern is filled with the current symbol
      return winningPattern.every(
        (patternIndex) => boardArray[patternIndex] === currentSymbol
      );
    });

    if (win) {
      roundResult(currentSymbol);
      return true;
    } else if (moveCount === 9) {
      roundResult();
      displayController.animateCurrentTurn(); // Disables turn animation when tie
      return true;
    }
  };

  const roundResult = (winner) => {
    if (winner === 'x') playerOne.winRound();
    if (winner === 'o') playerTwo.winRound();
    displayController.showRoundResult(winner);
  };

  // PUBLIC
  return {
    boardArray,
    winningPatterns,
    playerOneTurn,
    makeMove,
    getCurrentTurnSymbol,
    resetTurn,
    resetGame,
  };
})();

// AI MINIMAX MODULE
const minimaxAI = (() => {
  const getRandomFreeBoxIndex = () => {
    const freeBoxIndexes = [];
    for (let i = 0; i < 9; i++) {
      if (gameBoard.boardArray[i] === undefined) freeBoxIndexes.push(i);
    }
    const randomIndex = Math.floor(Math.random() * freeBoxIndexes.length);
    return freeBoxIndexes[randomIndex];
  };

  const makeRandomMove = () => {
    gameBoard.makeMove(getRandomFreeBoxIndex());
  };

  // PUBLIC
  return {
    makeRandomMove,
  };
})();

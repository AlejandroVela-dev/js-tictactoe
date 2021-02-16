'use strict';

/* TO DO:
  - Next Round -> Methods (reset gameBoard round, reset displayController board)
  - Reset Score -> Methods (reset PlayerOne/Two scores, refresh displayController scores)
  - displayController -> Current turn animation (get turn from gameBoard)
*/

// PLAYERS INITIALIZATION
let playerOne;
let playerTwo;

// DISPLAY CONTROLLER MODULE
const displayController = (() => {
  let gameMode;
  let aiDifficulty = 'easy';

  // SCREEN NAVIGATION ELEMENTS
  const gameScreens = document.querySelectorAll('.game');
  const navigationBtns = document.querySelectorAll('.navigation');

  // UI ELEMENTS
  const playerOneInput = document.querySelector('#player-1');
  const playerTwoInput = document.querySelector('#player-2');
  const enemyPicture = document.querySelectorAll('.enemy-picture');
  const enemySymbol = document.querySelector('.enemy-symbol');
  const enemyColor = document.querySelectorAll('.score-p2');
  const enemyAIDifficultyBtn = document.querySelectorAll('.diff-ai');
  const boardPlayerOneName = document.querySelector('.player-info__name-1');
  const boardPlayerTwoName = document.querySelector('.player-info__name-2');
  const boardDifficultyInfo = document.querySelector('.player-info__diff-ai');
  const boardBoxes = document.querySelectorAll('.board__box');
  const boardRoundResult = document.querySelector('.match-result');
  const boardRoundResultWinner = document.querySelector('.result--winner');
  const boardNextRoundBtn = document.querySelector('.controls__next-round');
  const boardResetScoreBtn = document.querySelector('.controls__reset-score');
  const boardPlayerOneScore = document.querySelectorAll('.score-p1__points');
  const boardPlayerTwoScore = document.querySelectorAll('.score-p2__points');

  // PLAYERS ATTRIBUTES
  const cssRoot = getComputedStyle(document.documentElement);
  const playerOneSymbol = 'svg/cross.svg';
  const playerOneColor = cssRoot.getPropertyValue('--player1');
  const playerTwoPicture = 'svg/player-alt.svg';
  const playerTwoSymbol = 'svg/circle-blue.svg';
  const playerTwoColor = cssRoot.getPropertyValue('--player2');
  const robotPicture = 'svg/robot.svg';
  const robotSymbol = 'svg/circle-red.svg';
  const robotColor = cssRoot.getPropertyValue('--robot');

  // METHODS - UI ELEMENTS
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

  const fillEnemyAttributes = (picture, color, symbol) => {
    enemyPicture.forEach((x) => (x.src = picture));
    enemyColor.forEach((x) => (x.style.color = color));
    enemySymbol.src = symbol;
  };

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

  const resetGame = () => {
    playerOneInput.value = '';
    playerTwoInput.value = '';
    boardDifficultyInfo.classList.remove(aiDifficulty);
    hideRoundResult();
    resetBoard();
  };

  // METHODS - GAME SCREEN MANAGEMENT
  const navigageTo = (screen) => {
    prepareScreen(screen);
    hideAllScreens();
    showScreen(screen);
  };

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

  navigationBtns.forEach((x) => {
    x.addEventListener('click', () => {
      const screen = x.dataset.destination;
      navigageTo(screen);
    });
  });

  // METHODS - GAME UTILITIES
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

  // GAME BOARD UI
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

  const resetBoard = () => {
    boardBoxes.forEach((box) => (box.firstElementChild.src = ''));
  };

  const showRoundResult = (winner) => {
    let winnerName;
    switch (winner) {
      case 'x':
        winnerName = playerOne.getName();
        boardRoundResultWinner.style.color = playerOneColor;
        boardRoundResultWinner.innerText = winnerName;
        refreshScores();
        break;

      case 'o':
        winnerName = playerTwo.getName();
        boardRoundResultWinner.innerText = winnerName;
        boardRoundResultWinner.style.color = enemyColor[0].style.color;
        refreshScores();
        break;

      default:
        boardRoundResultWinner.innerText = '';
        boardRoundResult.innerText = `It's a tie!`;
        break;
    }
    boardRoundResult.style.display = 'flex';
    boardNextRoundBtn.style.display = 'flex';
    boardResetScoreBtn.style.display = 'flex';
  };

  const hideRoundResult = () => {
    boardRoundResult.style.display = 'none';
    boardNextRoundBtn.style.display = 'none';
    boardResetScoreBtn.style.display = 'none';
  };

  const refreshScores = () => {
    boardPlayerOneScore.forEach(
      (score) => (score.innerText = playerOne.getScore())
    );
    boardPlayerTwoScore.forEach(
      (score) => (score.innerText = playerTwo.getScore())
    );
  };

  return {
    fillBoardBox,
    showRoundResult,
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
  const resetScore = () => (score = 0);
  const winRound = () => (score += 1);

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
  let playerOneTurn = true; // Allows turn-order management
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
    boardArray = [];
    moveCount = 0;
    playerOneTurn = true;
    playerOne = undefined;
    playerTwo = undefined;
    displayController.resetGame();
  };

  const getCurrentSymbol = () => {
    return playerOneTurn ? 'x' : 'o';
  };

  const fillArray = (index) => {
    boardArray[index] = getCurrentSymbol();
  };

  const isMoveLegal = (index) => {
    return boardArray[index] === undefined;
  };

  const makeMove = (index) => {
    if (isMoveLegal(index)) {
      fillArray(index);
      displayController.fillBoardBox(index, playerOneTurn);
      moveCount++;
      // Only check results after 4th movement
      if (moveCount >= 5) {
        checkRoundResult(getCurrentSymbol());
      }
      changeTurn();
    } else return;
  };

  const checkRoundResult = (currentSymbol) => {
    const win = winningPatterns.some((winningPattern) => {
      // Check and return true when first pattern is filled with the current symbol
      return winningPattern.every(
        (patternIndex) => boardArray[patternIndex] === currentSymbol
      );
    });

    if (win) roundResult(currentSymbol);
    else if (moveCount === 9) roundResult();
  };

  const roundResult = (winner) => {
    if (winner === 'x') playerOne.winRound();
    if (winner === 'o') playerTwo.winRound();
    displayController.showRoundResult(winner);
  };

  return {
    resetGame,
    makeMove,
  };
})();

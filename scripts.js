'use strict';

/* TO DO:
  - Refactor gameBoard methods (clearer logic)
  - Game result (Everything)
    -- Hide reset / next round when game unfinished
    -- Display divs and clean current game
  - Next Round (Everything)
  - Reset score (Everything)
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

  // PLAYERS ATTRIBUTES
  const playerOneSymbol = 'svg/cross.svg';
  const playerTwoPicture = 'svg/player-alt.svg';
  const playerTwoSymbol = 'svg/circle-blue.svg';
  const playerTwoColor = 'hsl(202, 100%, 70%)';
  const robotPicture = 'svg/robot.svg';
  const robotSymbol = 'svg/circle-red.svg';
  const robotColor = 'hsl(0, 100%, 58%)';

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

  const resetInputs = () => {
    playerOneInput.value = '';
    playerTwoInput.value = '';
    boardDifficultyInfo.classList.remove(aiDifficulty);
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

  return {
    fillBoardBox,
    resetInputs,
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
  const winCombinations = [
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
    displayController.resetInputs();
  };

  const getCurrentSymbol = () => {
    return playerOneTurn ? 'x' : 'o';
  };

  const fillArray = (index) => {
    boardArray[index] = getCurrentSymbol();
  };

  const makeMove = (index) => {
    if (boardArray[index] === undefined) {
      fillArray(index);
      displayController.fillBoardBox(index, playerOneTurn);
      moveCount++;
      if (moveCount >= 5) {
        checkResult(getCurrentSymbol());
      }
      changeTurn();
    } else return;
  };

  const checkResult = (currentSymbol) => {
    const win = winCombinations.some((winCombination) => {
      return winCombination.every(
        (index) => boardArray[index] === currentSymbol
      );
    });
    if (win) winGame();
    else if (moveCount === 9) tieGame();
  };

  const winGame = () => {
    console.log('Ez win');
  };

  const tieGame = () => {
    console.log('Tie');
  };

  return {
    resetGame,
    makeMove,
  };
})();

import './styles/style.scss'
import type { SettingsValues, CompleteSettingsValues, GridSize, PlayerColor, ExitConfirmOverride } from './types';
import { THEME_IMAGE_MAP, DIVIDER_ICON_PATHS, BOARD_SIZE_GRID_MAP, BOARD_SIZE_GAP_MAP, THEME_CLASS_MAP, THEME_EXIT_OVERRIDE_MAP, THEME_CARD_IMAGE_MAP } from './constants';

document.addEventListener('DOMContentLoaded', init);

export let isBoardInteractionLocked = false;
let firstOpenedCard: HTMLButtonElement | null = null;
let secondOpenedCard: HTMLButtonElement | null = null;
export let activePlayerColor: PlayerColor = 'blue';
export let playerScores: Record<PlayerColor, number> = {
    orange: 0,
    blue: 0,
    tie: 0,
};
export let isGameFinished = false;

/**
 * Initializes the app after the DOM is loaded.
 */
function init() {
    if (document.body.classList.contains('settings')) initSettingsPage();
    if (document.body.classList.contains('game')) initGamePage();
}

/**
 * Initializes the game page with saved settings.
 */
function initGamePage() {
    const savedSettings = getSavedSettings();
    if (!savedSettings) return;
    applyThemeClass(savedSettings.theme);
    activePlayerColor = savedSettings.player === 'Orange' ? 'orange' : 'blue';
    initScoreBoard();
    renderGameBoard(savedSettings.boardSize, savedSettings.theme);
    initExitButton();
}

import { initSettingsPage } from './settingsPage';

/**
 * Adds a click event to the Home button in the game.html to switch to the settings page without reloading.
 *
 * @param button The HTMLElement of the game.html containing the Home/Back button.
 */
export function getBackToSettings(button: HTMLAnchorElement) {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        history.back();
    });
}

/**
 * Loads saved settings from localStorage.
 * @returns The saved settings or null
 */
function getSavedSettings(): CompleteSettingsValues | null {
    const savedSettingsRaw = localStorage.getItem('memory.settings');
    if (!savedSettingsRaw) return null;
    try {
        const parsedSettings = JSON.parse(savedSettingsRaw) as Partial<CompleteSettingsValues>;
        if (!parsedSettings.theme || !parsedSettings.player || !parsedSettings.boardSize) return null;
        return {
            theme: parsedSettings.theme,
            player: parsedSettings.player,
            boardSize: parsedSettings.boardSize,
        };
    } catch {
        return null;
    }
}

/**
 * Sets the theme class on the body.
 * @param theme The theme name
 */
function applyThemeClass(theme: string) {
    const allThemeClasses = Object.values(THEME_CLASS_MAP);
    document.body.classList.remove(...allThemeClasses);
    const activeThemeClass = THEME_CLASS_MAP[theme];
    if (!activeThemeClass) return;
    document.body.classList.add(activeThemeClass);
}

/**
 * Renders the game board based on size and theme.
 * @param boardSize The board size
 * @param theme The selected theme
 */
function renderGameBoard(boardSize: string, theme: string) {
    const gameBoard = document.querySelector<HTMLElement>('.game__main');
    if (!gameBoard) return;
    isGameFinished = false;
    const boardRenderData = getBoardRenderData(boardSize, theme);
    if (!boardRenderData) return;
    const { gridSize, fieldCount, pairCount, themeImages } = boardRenderData;
    const selectedPairImages = themeImages.slice(0, pairCount);
    const shuffledCardImages = shuffleArray([...selectedPairImages, ...selectedPairImages]);
    gameBoard.innerHTML = '';
    gameBoard.style.setProperty('--game-grid-cols', String(gridSize.cols));
    gameBoard.style.setProperty('--game-grid-gap', BOARD_SIZE_GAP_MAP[boardSize] ?? '16px');
    for (let cardIndex = 0; cardIndex < fieldCount; cardIndex++) {
        appendGameCardField(gameBoard, cardIndex, shuffledCardImages[cardIndex]);
    }
}

/**
 * Provides the data for rendering the board.
 * @param boardSize The board size
 * @param theme The selected theme
 * @returns Board data or null
 */
function getBoardRenderData(boardSize: string, theme: string) {
    const gridSize = BOARD_SIZE_GRID_MAP[boardSize];
    if (!gridSize) return null;
    const fieldCount = gridSize.rows * gridSize.cols;
    const pairCount = fieldCount / 2;
    const themeImages = THEME_CARD_IMAGE_MAP[theme];
    if (!themeImages || themeImages.length < pairCount) return null;
    return { gridSize, fieldCount, pairCount, themeImages };
}

/**
 * Appends a card field to the game board.
 * @param gameBoard The game board element
 * @param cardIndex Index of the card
 * @param cardImagePath Image path of the card
 */
function appendGameCardField(gameBoard: HTMLElement, cardIndex: number, cardImagePath: string) {
    const cardField = document.createElement('button');
    cardField.className = 'game__card';
    cardField.type = 'button';
    cardField.dataset.cardKey = cardImagePath;
    cardField.setAttribute('aria-label', `Card ${cardIndex + 1}`);
    cardField.setAttribute('aria-pressed', 'false');
    buildGameCardContent(cardField, cardIndex, cardImagePath);
    gameBoard.appendChild(cardField);
}

/**
 * Builds the content of a game card.
 * @param cardField The card button element
 * @param cardIndex Index of the card
 * @param cardImagePath Image path of the card
 */
function buildGameCardContent(cardField: HTMLButtonElement, cardIndex: number, cardImagePath: string) {
    const cardInner = document.createElement('span');
    cardInner.className = 'game__card-inner';
    const cardFront = createCardFrontFace();
    const cardBack = createCardBackFace(cardIndex, cardImagePath);
    cardInner.append(cardFront, cardBack);
    cardField.appendChild(cardInner);
    attachCardFlipHandler(cardField);
}

/**
 * Attaches the flip handler to a card.
 * @param cardField The card button element
 */
function attachCardFlipHandler(cardField: HTMLButtonElement) {
    cardField.addEventListener('click', () => {
        handleCardFlip(cardField);
    });
}

/**
 * Handles flipping a card.
 * @param cardField The card button element
 */
function handleCardFlip(cardField: HTMLButtonElement) {
    if (isCardNotFlippable(cardField)) return;
    flipCardUp(cardField);
    if (!firstOpenedCard) {
        firstOpenedCard = cardField;
        return;
    }
    secondOpenedCard = cardField;
    isBoardInteractionLocked = true;
    resolveOpenedPair();
}

/**
 * Checks if a card cannot be flipped.
 * @param cardField The card button element
 * @returns True if not flippable
 */
function isCardNotFlippable(cardField: HTMLButtonElement): boolean {
    return isGameFinished
        || isBoardInteractionLocked
        || cardField.classList.contains('is-flipped')
        || cardField.classList.contains('is-match');
}

/**
 * Flips a card up.
 * @param cardField The card button element
 */
function flipCardUp(cardField: HTMLButtonElement) {
    cardField.classList.add('is-flipped');
    cardField.setAttribute('aria-pressed', 'true');
}

/**
 * Resolves the opened pair.
 */
function resolveOpenedPair() {
    if (!firstOpenedCard || !secondOpenedCard) return;
    const hasMatch = firstOpenedCard.dataset.cardKey === secondOpenedCard.dataset.cardKey;
    if (hasMatch) {
        isCardMatching(firstOpenedCard, secondOpenedCard)
        return;
    }
    window.setTimeout(() => {
        if (firstOpenedCard) flipCardDown(firstOpenedCard);
        if (secondOpenedCard) flipCardDown(secondOpenedCard);
        switchActivePlayer();
        resetBoardOpenPairState();
    }, 1000);
}

/**
 * Checks if the cards match.
 * @param firstOpenedCard The first opened card
 * @param secondOpenedCard The second opened card
 */
function isCardMatching(firstOpenedCard: HTMLButtonElement, secondOpenedCard: HTMLButtonElement) {
    markCardAsMatched(firstOpenedCard);
    markCardAsMatched(secondOpenedCard);
    addPointToActivePlayer();
    checkGameOver();
    resetBoardOpenPairState();
}

/**
 * Marks the card as matched.
 * @param cardField The card field
 */
function markCardAsMatched(cardField: HTMLButtonElement) {
    cardField.classList.add('is-match');
    const cardBackFace = cardField.querySelector<HTMLElement>('.game__card-face--back');
    cardBackFace?.classList.add('is-match');
}

/**
 * Flips the card down.
 * @param cardField The card field
 */
function flipCardDown(cardField: HTMLButtonElement) {
    cardField.classList.remove('is-flipped');
    cardField.setAttribute('aria-pressed', 'false');
}

/**
 * Resets the board open pair state.
 */
function resetBoardOpenPairState() {
    firstOpenedCard = null;
    secondOpenedCard = null;
    isBoardInteractionLocked = false;
}

/**
 * Initializes the score board.
 */
function initScoreBoard() {
    playerScores = {
        orange: 0,
        blue: 0,
        tie: 0,
    };
    updateScoreBoard();
    updateCurrentPlayerDisplay();
}

/**
 * Adds a point to the active player.
 */
export function addPointToActivePlayer() {
    playerScores[activePlayerColor] += 1;
    updateScoreBoard();
}

/**
 * Updates the score board.
 */
export function updateScoreBoard() {
    const scoreElements = document.querySelectorAll<HTMLElement>('.score__player--number');
    const scoreValues: PlayerColor[] = ['blue', 'orange'];
    scoreElements.forEach((scoreElement, index) => {
        const color = scoreValues[index];
        scoreElement.textContent = String(color ? playerScores[color] : 0);
    });
}

/**
 * Switches the active player.
 */
export function switchActivePlayer() {
    activePlayerColor = activePlayerColor === 'orange' ? 'blue' : 'orange';
    updateCurrentPlayerDisplay();
}

/**
 * Updates the current player display.
 */
function updateCurrentPlayerDisplay() {
    const currentPlayerText = document.querySelector<HTMLElement>('.current__player--text');
    if (currentPlayerText) currentPlayerText.textContent = 'Current player:';
    const currentPlayerContainer = document.querySelector<HTMLElement>('.current__player');
    const currentPlayerIcons = document.querySelectorAll<SVGSVGElement>('.current__player svg');
    if (!currentPlayerIcons.length) return;
    const normalizedPlayerIndex = activePlayerColor === 'blue' ? 0 : 1;
    if (currentPlayerContainer) {
        currentPlayerContainer.setAttribute('data-active-player', String(normalizedPlayerIndex));
    }
    currentPlayerIcons.forEach((icon, index) => {
        icon.classList.toggle('current__player--active', index === normalizedPlayerIndex);
    });
}

import {
    checkGameOver,
    handleGameFinished,
    getActiveThemeName,
    showGameOverScreen,
    setTitleEndScreen,
    addScoreboardToGameOver,
    removeGameOverScreen,
    initExitButton,
    showExitConfirm,
    createPopupText,
    showGameNavScreen,
    getWinningPlayerClass
} from './gameOverlay';
// Re-Export für gameOverlay.ts


/**
 * Creates the card front face.
 * @returns The card front face
 */
function createCardFrontFace(): HTMLSpanElement {
    const cardFront = document.createElement('span');
    cardFront.className = 'game__card-face game__card-face--front';
    return cardFront;
}

/**
 * Creates the card back face.
 * @param cardIndex The card index
 * @param cardImagePath The card image path
 * @returns The card back face
 */
function createCardBackFace(cardIndex: number, cardImagePath: string): HTMLSpanElement {
    const cardBack = document.createElement('span');
    cardBack.className = 'game__card-face game__card-face--back';
    const cardBackImage = document.createElement('img');
    cardBackImage.src = cardImagePath;
    cardBackImage.alt = `Card ${cardIndex + 1}`;
    cardBackImage.draggable = false;
    cardBack.appendChild(cardBackImage);
    return cardBack;
}

/**
 * Shuffles an array.
 * @param items The items
 * @returns The shuffled items
 */
function shuffleArray<T>(items: T[]): T[] {
    const shuffledItems = [...items];
    for (let index = shuffledItems.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
    }
    return shuffledItems;
}
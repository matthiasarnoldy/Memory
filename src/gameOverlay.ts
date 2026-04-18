import type { PlayerColor, ExitConfirmOverride } from './types';
import { THEME_EXIT_OVERRIDE_MAP } from './constants';
import {
    playerScores,
    activePlayerColor,
    isGameFinished,
    isBoardInteractionLocked,
    getBackToSettings,
    addPointToActivePlayer,
    switchActivePlayer,
    updateScoreBoard
} from './main';

/**
 * Checks if the game is over and triggers the end sequence if all pairs are found.
 */
export function checkGameOver() {
    const allCards = document.querySelectorAll<HTMLButtonElement>('.game__card');
    if (!allCards.length) return;
    const matchedCardsCount = document.querySelectorAll<HTMLButtonElement>('.game__card.is-match').length;
    const allPairsFound = matchedCardsCount === allCards.length;
    if (!allPairsFound) return;
    handleGameFinished();
}

/**
 * Handles the end of the game: sets flags, shows overlays, and resets after a delay.
 */
export function handleGameFinished() {
    if (isGameFinished) return;
    (window as any).isGameFinished = true;
    (window as any).isBoardInteractionLocked = true;
    const activeThemeName = getActiveThemeName();
    showGameOverScreen(activeThemeName);
    setTimeout(() => {
        removeGameOverScreen();
        showGameNavScreen(activeThemeName);
    }, 3000);
}

/**
 * Returns the currently active theme name from the body class.
 * @returns The active theme name or 'default'.
 */
export function getActiveThemeName(): string {
    const activeThemeClass = Array.from(document.body.classList).find((className) => className.startsWith('theme--'));
    return activeThemeClass ? activeThemeClass.replace('theme--', '') : 'default';
}

/**
 * Displays the game over screen overlay with the final scores.
 * @param themeName The current theme name
 */
export function showGameOverScreen(themeName: string) {
    const gameOverTemplate = document.querySelector<HTMLTemplateElement>('#game-over-template');
    if (!gameOverTemplate) return;
    const gameOverScreen = gameOverTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
    if (!gameOverScreen) return;
    gameOverScreen.classList.add(`game-over-screen--${themeName}`);
    const summaryContainer = gameOverScreen.querySelector<HTMLElement>('.game-over-screen__summary');
    const sourceScoreBoard = document.querySelector<HTMLElement>('.game__header .game__score');
    if (summaryContainer && sourceScoreBoard) {
        addScoreboardToGameOver(sourceScoreBoard, summaryContainer);
    }
    document.body.appendChild(gameOverScreen);
}

/**
 * Sets the title of the end screen based on the winner.
 * @param gameNavScreen The navigation screen element
 */
export function setTitleEndScreen(gameNavScreen: HTMLElement) {
    const titleElement = gameNavScreen.querySelector<HTMLElement>('.nav-screen--title');
    if (!titleElement) return;
    if (playerScores.blue === playerScores.orange) {
        titleElement.textContent = 'TIE';
    } else if (playerScores.blue > playerScores.orange) {
        titleElement.textContent = 'BLUE PLAYER';
    } else if (playerScores.orange > playerScores.blue) {
        titleElement.textContent = 'ORANGE PLAYER';
    }
}

/**
 * Adds the final scoreboard to the game over overlay.
 * @param sourceScoreBoard The source scoreboard element
 * @param summaryContainer The container for the summary
 */
export function addScoreboardToGameOver(sourceScoreBoard: HTMLElement, summaryContainer: HTMLElement) {
    const finalScoreBoard = sourceScoreBoard.cloneNode(true) as HTMLElement;
    finalScoreBoard.classList.add('game-over-screen__game-score');
    const finalScoreNumbers = finalScoreBoard.querySelectorAll<HTMLElement>('.score__player--number');
    const scoreValues: PlayerColor[] = ['blue', 'orange'];
    finalScoreNumbers.forEach((scoreElement, index) => {
        const color = scoreValues[index];
        scoreElement.textContent = String(color ? playerScores[color] : 0);
    });
    summaryContainer.appendChild(finalScoreBoard);
}

/**
 * Removes the game over screen overlay from the DOM.
 */
export function removeGameOverScreen() {
    document.querySelector('.game-over-screen')?.remove();
}

/**
 * Initializes the exit button in the game UI to show the exit confirmation popup.
 */
export function initExitButton() {
    const exitBtn = document.querySelector<HTMLAnchorElement>('#exit-game-btn');
    if (!exitBtn) return;
    exitBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showExitConfirm(getActiveThemeName());
    });
}

/**
 * Shows the exit confirmation popup with theme-specific overrides and listeners.
 * @param themeName The current theme name
 */
export function showExitConfirm(themeName: string) {
    if (document.querySelector('.exit-confirm')) return;
    const template = document.querySelector<HTMLTemplateElement>('#exit-confirm-template');
    if (!template) return;
    const popup = template.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
    if (!popup) return;
    const override = THEME_EXIT_OVERRIDE_MAP[themeName];
    createPopupText(override, popup);
    const backBtn = popup.querySelector<HTMLAnchorElement>('.exit-confirm__back');
    if (backBtn) addExitPopupBackListener(backBtn, popup);
    const exitBtn = popup.querySelector<HTMLAnchorElement>('.exit-confirm__exit');
    if (exitBtn) getBackToSettings(exitBtn);
    popup.addEventListener('click', (event) => { if (event.target === popup) popup.remove() });
    document.body.appendChild(popup);
}

/**
 * Adds a click listener to the back button of the exit popup to close the popup.
 * @param backBtn The back button element
 * @param popup The popup element
 */
function addExitPopupBackListener(backBtn: HTMLAnchorElement, popup: HTMLElement) {
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        popup.remove();
    });
}

/**
 * Sets the popup text content based on theme overrides.
 * @param override The theme-specific override object
 * @param popup The popup element
 */
export function createPopupText(override: ExitConfirmOverride, popup: HTMLElement) {
    if (override) {
        if (override.text) {
            const textEl = popup.querySelector<HTMLElement>('.exit-confirm__text');
            if (textEl) textEl.textContent = override.text;
        }
        if (override.back) {
            const backLabelEl = popup.querySelector<HTMLElement>('.exit-confirm__back');
            if (backLabelEl) backLabelEl.textContent = override.back;
        }
        if (override.exit) {
            const exitLabelEl = popup.querySelector<HTMLElement>('.exit-confirm__exit');
            if (exitLabelEl) exitLabelEl.textContent = override.exit;
        }
    }
}

/**
 * Shows the navigation screen after the game ends, including winner and home button.
 * @param themeName The current theme name
 */
export function showGameNavScreen(themeName: string) {
    const gameNavTemplate = document.querySelector<HTMLTemplateElement>('#game-nav-template');
    if (!gameNavTemplate) return;
    const gameNavScreen = gameNavTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
    if (!gameNavScreen) return;
    gameNavScreen.classList.add(`game-nav-screen--${themeName}`);
    setTitleEndScreen(gameNavScreen);
    const panel = gameNavScreen.querySelector<HTMLElement>('.game-nav-screen__panel');
    if (panel) panel.classList.add(getWinningPlayerClass());
    document.body.appendChild(gameNavScreen);
    const homeBtn = gameNavScreen.querySelector<HTMLAnchorElement>(".game-nav-screen__btn");
    if (!homeBtn) return;
    getBackToSettings(homeBtn);
}

/**
 * Returns the winning player class ('blue', 'orange', or 'tie') for styling.
 * @returns The winning player color or 'tie'.
 */
export function getWinningPlayerClass() {
    if (playerScores.blue > playerScores.orange) return 'blue';
    if (playerScores.orange > playerScores.blue) return 'orange';
    if (playerScores.orange === playerScores.blue) return 'tie';
    return activePlayerColor;
}

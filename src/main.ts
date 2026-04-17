import './styles/style.scss'

document.addEventListener('DOMContentLoaded', init);

type SettingsValues = {
    theme: string | null;
    player: string | null;
    boardSize: string | null;
};

type CompleteSettingsValues = {
    theme: string;
    player: string;
    boardSize: string;
};

type GridSize = {
    rows: number;
    cols: number;
};

type PlayerColor = 'orange' | 'blue' | 'tie';

const themeImageMap: Record<string, string> = {
    CodeVibesTheme: 'assets/img/codeVibes.png',
    GamingTheme: 'assets/img/gaming.png',
    DaProjectsTheme: 'assets/img/daProjects.png',
};

const dividerIconPaths = {
    default: 'assets/icons/dividingLine.svg',
    active: 'assets/icons/decorLineRotated.svg',
};

const boardSizeGridMap: Record<string, GridSize> = {
    '16': { rows: 4, cols: 4 },
    '24': { rows: 4, cols: 6 },
    '36': { rows: 6, cols: 6 },
};

const boardSizeGapMap: Record<string, string> = {
    '16': '16px',
    '24': '8px',
    '36': '8px',
};

const themeClassMap: Record<string, string> = {
    CodeVibesTheme: 'theme--codevibes',
    GamingTheme: 'theme--gaming',
    DaProjectsTheme: 'theme--da-projects',
};

type ExitConfirmOverride = {
    text?: string;
    back?: string;
    exit?: string;
};

const themeExitOverrideMap: Record<string, ExitConfirmOverride> = {
    gaming: { back: 'No, back to game', exit: 'Yes, exit game' },
};

const themeCardImageMap: Record<string, string[]> = {
    CodeVibesTheme: [
        'assets/img/codeVibes/angular.png',
        'assets/img/codeVibes/bootstrap.png',
        'assets/img/codeVibes/css.png',
        'assets/img/codeVibes/django.png',
        'assets/img/codeVibes/firebase.png',
        'assets/img/codeVibes/git.png',
        'assets/img/codeVibes/github.png',
        'assets/img/codeVibes/html.png',
        'assets/img/codeVibes/javaScript.png',
        'assets/img/codeVibes/nodeJs.png',
        'assets/img/codeVibes/python.png',
        'assets/img/codeVibes/react.png',
        'assets/img/codeVibes/sass.png',
        'assets/img/codeVibes/sql.png',
        'assets/img/codeVibes/terminal.png',
        'assets/img/codeVibes/typeScript.png',
        'assets/img/codeVibes/vsCode.png',
        'assets/img/codeVibes/vueJs.png',
    ],
    GamingTheme: [
        'assets/img/gaming/banana.png',
        'assets/img/gaming/circle.png',
        'assets/img/gaming/coin.png',
        'assets/img/gaming/controller.png',
        'assets/img/gaming/creeper.png',
        'assets/img/gaming/diamond.png',
        'assets/img/gaming/dice.png',
        'assets/img/gaming/gameBoy.png',
        'assets/img/gaming/levelUp.png',
        'assets/img/gaming/maze.png',
        'assets/img/gaming/pacman.png',
        'assets/img/gaming/pacmanHunter.png',
        'assets/img/gaming/play.png',
        'assets/img/gaming/puzzle.png',
        'assets/img/gaming/snake.png',
        'assets/img/gaming/sqaure.png',
        'assets/img/gaming/toad.png',
        'assets/img/gaming/triangle.png',
    ],
    DaProjectsTheme: [
        'assets/img/daProjects/basket.png',
        'assets/img/daProjects/chef.png',
        'assets/img/daProjects/coderr.png',
        'assets/img/daProjects/coins.png',
        'assets/img/daProjects/cuisine.png',
        'assets/img/daProjects/daBubble.png',
        'assets/img/daProjects/eggs.png',
        'assets/img/daProjects/elPolloLoco.png',
        'assets/img/daProjects/hotCup.png',
        'assets/img/daProjects/join.png',
        'assets/img/daProjects/kanMind.png',
        'assets/img/daProjects/memory.png',
        'assets/img/daProjects/noodles.png',
        'assets/img/daProjects/pokedex.png',
        'assets/img/daProjects/portfolio.png',
        'assets/img/daProjects/sakura.png',
        'assets/img/daProjects/sharkie.png',
        'assets/img/daProjects/videoFlix.png',
    ],
};

let isBoardInteractionLocked = false;
let firstOpenedCard: HTMLButtonElement | null = null;
let secondOpenedCard: HTMLButtonElement | null = null;
let activePlayerColor: PlayerColor = 'blue';
let playerScores: Record<PlayerColor, number> = {
    orange: 0,
    blue: 0,
    tie: 0,
};
let isGameFinished = false;

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

/**
 * Initializes the settings page.
 */
function initSettingsPage() {
    initPlayButton();
    initPreviewImage();
    initSelectedSummary();
}

/**
 * Initializes the play button and its events.
 */
function initPlayButton() {
    const playButton = document.querySelector<HTMLAnchorElement>('.button--small');
    if (!playButton) return;
    playButton.addEventListener('click', handlePlayButtonClick);
    const radioInputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    radioInputs.forEach((input) => {
        input.addEventListener('change', () => {
            updatePlayButtonState(playButton);
            updateThemePreviewImage(document.querySelector<HTMLImageElement>('.options__choosed > img'));
            initSelectedSummary();
        });
    });
    updatePlayButtonState(playButton);
}

/**
 * Initializes the preview image for the selected theme.
 */
function initPreviewImage() {
    const themePreviewImage = document.querySelector<HTMLImageElement>('.options__choosed > img');
    updateThemePreviewImage(themePreviewImage);
}

/**
 * Updates the summary of selected settings.
 */
function initSelectedSummary() {
    const selectedThemeText = document.querySelector<HTMLElement>('.settings__selected-theme');
    const selectedPlayerText = document.querySelector<HTMLElement>('.settings__selected-player');
    const selectedBoardSizeText = document.querySelector<HTMLElement>('.settings__selected-board-size');
    if (!selectedThemeText || !selectedPlayerText || !selectedBoardSizeText) return;
    updateSelectedSummary(selectedThemeText, selectedPlayerText, selectedBoardSizeText);
}

/**
 * Event handler for the play button.
 * @param event The click event
 */
function handlePlayButtonClick(event: MouseEvent) {
    const checkedValues = getCheckedValue();
    if (!hasCompleteSelection(checkedValues)) {
        event.preventDefault();
        return;
    }
    saveSettings(checkedValues);
}

/**
 * Checks if all settings are selected.
 * @param values The current settings
 * @returns True if complete
 */
function hasCompleteSelection(values: SettingsValues): values is CompleteSettingsValues {
    return Boolean(values.theme && values.player && values.boardSize);
}

/**
 * Enables/disables the play button depending on selection.
 * @param playButton The play button
 */
function updatePlayButtonState(playButton: HTMLAnchorElement) {
    const checkedValues = getCheckedValue();
    const isComplete = hasCompleteSelection(checkedValues);
    playButtonActions(playButton, isComplete);
}

/**
 * Sets the state and attributes of the play button.
 * @param playButton The play button
 * @param isComplete Whether the selection is complete
 */
function playButtonActions(playButton: HTMLAnchorElement, isComplete: boolean) {
    playButton.classList.toggle('is-disabled', !isComplete);
    playButton.setAttribute('aria-disabled', String(!isComplete));
    updateSelectedDividerIcons(isComplete);
    if (isComplete) {
        playButton.removeAttribute('tabindex');
        return;
    }
    playButton.setAttribute('tabindex', '-1');
}

/**
 * Updates the divider icons depending on selection state.
 * @param isComplete Whether the selection is complete
 */
function updateSelectedDividerIcons(isComplete: boolean) {
    const dividerIcons = document.querySelectorAll<HTMLImageElement>('.settings__choosed--wrapper img');
    const activeIconPath = isComplete ? dividerIconPaths.active : dividerIconPaths.default;
    dividerIcons.forEach((icon) => {
        icon.src = activeIconPath;
    });
}

/**
 * Saves the settings to localStorage.
 * @param values The settings to save
 */
function saveSettings(values: CompleteSettingsValues) {
    localStorage.setItem('memory.settings', JSON.stringify(values));
}

/**
 * Updates the preview image for the selected theme.
 * @param themePreviewImage The preview image element
 */
function updateThemePreviewImage(themePreviewImage: HTMLImageElement | null) {
    if (!themePreviewImage) return;
    const selectedTheme = getCheckedValue().theme;
    if (!selectedTheme) return;
    const nextImagePath = themeImageMap[selectedTheme];
    themePreviewImage.src = nextImagePath;
}

/**
 * Updates the text fields for the selected settings.
 * @param selectedThemeText Element for theme
 * @param selectedPlayerText Element for player
 * @param selectedBoardSizeText Element for board size
 */
function updateSelectedSummary(
    selectedThemeText: HTMLElement,
    selectedPlayerText: HTMLElement,
    selectedBoardSizeText: HTMLElement,
) {
    const selectedThemeLabel = getCheckedLabelText('themes');
    const selectedPlayerLabel = getCheckedLabelText('cardCount');
    const selectedBoardSizeLabel = getCheckedLabelText('players');
    if (selectedThemeLabel) selectedThemeText.textContent = selectedThemeLabel;
    if (selectedPlayerLabel) selectedPlayerText.textContent = selectedPlayerLabel;
    if (selectedBoardSizeLabel) selectedBoardSizeText.textContent = "Board - " + selectedBoardSizeLabel;
}

/**
 * Gets the label of the selected radio button in a group.
 * @param groupName Name of the radio group
 * @returns The label or null
 */
function getCheckedLabelText(groupName: string): string | null {
    const checkedInput = document.querySelector<HTMLInputElement>(`input[name="${groupName}"]:checked`);
    if (!checkedInput) return null;
    const label = checkedInput.closest('label');
    const labelText = label?.querySelector('.settings__choosing span')?.textContent?.trim();
    return labelText || checkedInput.value;
}

/**
 * Gets the currently selected values from the radio buttons.
 * @returns The current settings
 */
function getCheckedValue(): SettingsValues {
    const checkedTheme = document.querySelector<HTMLInputElement>('input[name="themes"]:checked');
    const checkedPlayer = document.querySelector<HTMLInputElement>('input[name="cardCount"]:checked');
    const checkedBoardSize = document.querySelector<HTMLInputElement>('input[name="players"]:checked');
    return {
        theme: checkedTheme ? checkedTheme.value : null,
        player: checkedPlayer ? checkedPlayer.value : null,
        boardSize: checkedBoardSize ? checkedBoardSize.value : null,
    };
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
    const allThemeClasses = Object.values(themeClassMap);
    document.body.classList.remove(...allThemeClasses);
    const activeThemeClass = themeClassMap[theme];
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
    gameBoard.style.setProperty('--game-grid-gap', boardSizeGapMap[boardSize] ?? '16px');
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
    const gridSize = boardSizeGridMap[boardSize];
    if (!gridSize) return null;
    const fieldCount = gridSize.rows * gridSize.cols;
    const pairCount = fieldCount / 2;
    const themeImages = themeCardImageMap[theme];
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
function addPointToActivePlayer() {
    playerScores[activePlayerColor] += 1;
    updateScoreBoard();
}

/**
 * Updates the score board.
 */
function updateScoreBoard() {
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
function switchActivePlayer() {
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

/**
 * Checks if the game is over.
 */
function checkGameOver() {
    const allCards = document.querySelectorAll<HTMLButtonElement>('.game__card');
    if (!allCards.length) return;
    const matchedCardsCount = document.querySelectorAll<HTMLButtonElement>('.game__card.is-match').length;
    const allPairsFound = matchedCardsCount === allCards.length;
    if (!allPairsFound) return;
    handleGameFinished();
}

/**
 * Handles the game finished.
 */
function handleGameFinished() {
    if (isGameFinished) return;
    isGameFinished = true;
    isBoardInteractionLocked = true;
    const activeThemeName = getActiveThemeName();
    showGameOverScreen(activeThemeName);
    setTimeout(() => {
        removeGameOverScreen();
        showGameNavScreen(activeThemeName);
    }, 1200);
}

/**
 * Gets the active theme name.
 * @returns The active theme name
 */
function getActiveThemeName(): string {
    const activeThemeClass = Array.from(document.body.classList).find((className) => className.startsWith('theme--'));
    return activeThemeClass ? activeThemeClass.replace('theme--', '') : 'default';
}

/**
 * Shows the game over screen.
 * @param themeName The theme name
 */
function showGameOverScreen(themeName: string) {
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
 * Sets the title end screen.
 * @param gameNavScreen The game nav screen
 */
function setTitleEndScreen(gameNavScreen: HTMLElement) {
    const titleElement = gameNavScreen.querySelector<HTMLElement>('.nav-screen--title');
    if (!titleElement) return;
    if (playerScores.blue === playerScores.orange) {
        titleElement.textContent = 'TIE'
    } else if (playerScores.blue > playerScores.orange) {
        titleElement.textContent = 'BLUE PLAYER';
    } else if (playerScores.orange > playerScores.blue) {
        titleElement.textContent = 'ORANGE PLAYER';
    }
}

/**
 * Adds the scoreboard to the game over screen.
 * @param sourceScoreBoard The source scoreboard
 * @param summaryContainer The summary container
 */
function addScoreboardToGameOver(sourceScoreBoard: HTMLElement, summaryContainer: HTMLElement) {
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
 * Removes the game over screen.
 */
function removeGameOverScreen() {
    document.querySelector('.game-over-screen')?.remove();
}

/**
 * Initializes the exit button.
 */
function initExitButton() {
    const exitBtn = document.querySelector<HTMLAnchorElement>('#exit-game-btn');
    if (!exitBtn) return;
    exitBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showExitConfirm(getActiveThemeName());
    });
}

/**
 * Shows the exit confirm.
 * @param themeName The theme name
 */
function showExitConfirm(themeName: string) {
    if (document.querySelector('.exit-confirm')) return;
    const template = document.querySelector<HTMLTemplateElement>('#exit-confirm-template');
    if (!template) return;
    const popup = template.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
    if (!popup) return;
    const override = themeExitOverrideMap[themeName];
    createPopupText(override, popup);
    const backBtn = popup.querySelector<HTMLButtonElement>('.exit-confirm__back');
    backBtn?.addEventListener('click', () => popup.remove());
    popup.addEventListener('click', (event) => {
        if (event.target === popup) popup.remove();
    });
    document.body.appendChild(popup);
}

/**
 * Creates the popup text.
 * @param override The override
 * @param popup The popup
 */
function createPopupText(override: ExitConfirmOverride, popup: HTMLElement) {
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
 * Shows the game nav screen.
 * @param themeName The theme name
 */
function showGameNavScreen(themeName: string) {
    const gameNavTemplate = document.querySelector<HTMLTemplateElement>('#game-nav-template');
    if (!gameNavTemplate) return;
    const gameNavScreen = gameNavTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
    if (!gameNavScreen) return;
    gameNavScreen.classList.add(`game-nav-screen--${themeName}`);
    setTitleEndScreen(gameNavScreen);
    const panel = gameNavScreen.querySelector<HTMLElement>('.game-nav-screen__panel');
    if (panel) {
        panel.classList.add(getWinningPlayerClass());
    }
    document.body.appendChild(gameNavScreen);
}

/**
 * Gets the winning player class.
 * @returns The winning player class
 */
function getWinningPlayerClass(): 'orange' | 'blue' | 'tie' {
    if (playerScores.blue > playerScores.orange) return 'blue';
    if (playerScores.orange > playerScores.blue) return 'orange';
    if (playerScores.orange === playerScores.blue) return 'tie';
    return activePlayerColor;
}

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

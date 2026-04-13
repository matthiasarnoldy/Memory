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

const themeImageMap: Record<string, string> = {
    CodeVibesTheme: '../public/assets/img/codeVibes.png',
    GamingTheme: '../public/assets/img/gaming.png',
    DaProjectsTheme: '../public/assets/img/daProjects.png',
};

const dividerIconPaths = {
    default: '../public/assets/icons/dividingLine.svg',
    active: '../public/assets/icons/decorLineRotated.svg',
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

const themeCardImageMap: Record<string, string[]> = {
    CodeVibesTheme: [
        '../public/assets/img/codeVibes/angular.png',
        '../public/assets/img/codeVibes/bootstrap.png',
        '../public/assets/img/codeVibes/css.png',
        '../public/assets/img/codeVibes/django.png',
        '../public/assets/img/codeVibes/firebase.png',
        '../public/assets/img/codeVibes/git.png',
        '../public/assets/img/codeVibes/github.png',
        '../public/assets/img/codeVibes/html.png',
        '../public/assets/img/codeVibes/javaScript.png',
        '../public/assets/img/codeVibes/nodeJs.png',
        '../public/assets/img/codeVibes/python.png',
        '../public/assets/img/codeVibes/react.png',
        '../public/assets/img/codeVibes/sass.png',
        '../public/assets/img/codeVibes/sql.png',
        '../public/assets/img/codeVibes/terminal.png',
        '../public/assets/img/codeVibes/typeScript.png',
        '../public/assets/img/codeVibes/vsCode.png',
        '../public/assets/img/codeVibes/vueJs.png',
    ],
    GamingTheme: [
        '../public/assets/img/gaming/banana.png',
        '../public/assets/img/gaming/circle.png',
        '../public/assets/img/gaming/coin.png',
        '../public/assets/img/gaming/controller.png',
        '../public/assets/img/gaming/creeper.png',
        '../public/assets/img/gaming/diamond.png',
        '../public/assets/img/gaming/dice.png',
        '../public/assets/img/gaming/gameBoy.png',
        '../public/assets/img/gaming/levelUp.png',
        '../public/assets/img/gaming/maze.png',
        '../public/assets/img/gaming/pacman.png',
        '../public/assets/img/gaming/pacmanHunter.png',
        '../public/assets/img/gaming/play.png',
        '../public/assets/img/gaming/puzzle.png',
        '../public/assets/img/gaming/snake.png',
        '../public/assets/img/gaming/sqaure.png',
        '../public/assets/img/gaming/toad.png',
        '../public/assets/img/gaming/triangle.png',
    ],
    DaProjectsTheme: [
        '../public/assets/img/daProjects/basket.png',
        '../public/assets/img/daProjects/chef.png',
        '../public/assets/img/daProjects/coderr.png',
        '../public/assets/img/daProjects/coins.png',
        '../public/assets/img/daProjects/cuisine.png',
        '../public/assets/img/daProjects/daBubble.png',
        '../public/assets/img/daProjects/eggs.png',
        '../public/assets/img/daProjects/elPolloLoco.png',
        '../public/assets/img/daProjects/hotCup.png',
        '../public/assets/img/daProjects/join.png',
        '../public/assets/img/daProjects/kanMind.png',
        '../public/assets/img/daProjects/memory.png',
        '../public/assets/img/daProjects/noodles.png',
        '../public/assets/img/daProjects/pokedex.png',
        '../public/assets/img/daProjects/portfolio.png',
        '../public/assets/img/daProjects/sakura.png',
        '../public/assets/img/daProjects/sharkie.png',
        '../public/assets/img/daProjects/videoFlix.png',
    ],
};

function init() {
    if (document.body.classList.contains('settings')) initSettingsPage();
    if (document.body.classList.contains('game')) initGamePage();
}

function initGamePage() {
    const savedSettings = getSavedSettings();
    if (!savedSettings) return;
    applyThemeClass(savedSettings.theme);
    renderGameBoard(savedSettings.boardSize, savedSettings.theme);
}

function initSettingsPage() {
    initPlayButton();
    initPreviewImage();
    initSelectedSummary();
}

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

function initPreviewImage() {
    const themePreviewImage = document.querySelector<HTMLImageElement>('.options__choosed > img');
    updateThemePreviewImage(themePreviewImage);
}

function initSelectedSummary() {
    const selectedThemeText = document.querySelector<HTMLElement>('.settings__selected-theme');
    const selectedPlayerText = document.querySelector<HTMLElement>('.settings__selected-player');
    const selectedBoardSizeText = document.querySelector<HTMLElement>('.settings__selected-board-size');
    if (!selectedThemeText || !selectedPlayerText || !selectedBoardSizeText) return;
    updateSelectedSummary(selectedThemeText, selectedPlayerText, selectedBoardSizeText);
}

function handlePlayButtonClick(event: MouseEvent) {
    const checkedValues = getCheckedValue();
    if (!hasCompleteSelection(checkedValues)) {
        event.preventDefault();
        return;
    }
    saveSettings(checkedValues);
}

function hasCompleteSelection(values: SettingsValues): values is CompleteSettingsValues {
    return Boolean(values.theme && values.player && values.boardSize);
}

function updatePlayButtonState(playButton: HTMLAnchorElement) {
    const checkedValues = getCheckedValue();
    const isComplete = hasCompleteSelection(checkedValues);
    playButtonActions(playButton, isComplete);
}

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

function updateSelectedDividerIcons(isComplete: boolean) {
    const dividerIcons = document.querySelectorAll<HTMLImageElement>('.settings__choosed--wrapper img');
    const activeIconPath = isComplete ? dividerIconPaths.active : dividerIconPaths.default;
    dividerIcons.forEach((icon) => {
        icon.src = activeIconPath;
    });
}

function saveSettings(values: CompleteSettingsValues) {
    localStorage.setItem('memory.settings', JSON.stringify(values));
}

function updateThemePreviewImage(themePreviewImage: HTMLImageElement | null) {
    if (!themePreviewImage) return;
    const selectedTheme = getCheckedValue().theme;
    if (!selectedTheme) return;
    const nextImagePath = themeImageMap[selectedTheme];
    themePreviewImage.src = nextImagePath;
}

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

function getCheckedLabelText(groupName: string): string | null {
    const checkedInput = document.querySelector<HTMLInputElement>(`input[name="${groupName}"]:checked`);
    if (!checkedInput) return null;
    const label = checkedInput.closest('label');
    const labelText = label?.querySelector('.settings__choosing span')?.textContent?.trim();
    return labelText || checkedInput.value;
}

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

function applyThemeClass(theme: string) {
    const allThemeClasses = Object.values(themeClassMap);
    document.body.classList.remove(...allThemeClasses);
    const activeThemeClass = themeClassMap[theme];
    if (!activeThemeClass) return;
    document.body.classList.add(activeThemeClass);
}

function renderGameBoard(boardSize: string, theme: string) {
    const gameBoard = document.querySelector<HTMLElement>('.game__main');
    if (!gameBoard) return;
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

function getBoardRenderData(boardSize: string, theme: string) {
    const gridSize = boardSizeGridMap[boardSize];
    if (!gridSize) return null;
    const fieldCount = gridSize.rows * gridSize.cols;
    const pairCount = fieldCount / 2;
    const themeImages = themeCardImageMap[theme];
    if (!themeImages || themeImages.length < pairCount) return null;
    return { gridSize, fieldCount, pairCount, themeImages };
}

function appendGameCardField(gameBoard: HTMLElement, cardIndex: number, cardImagePath: string) {
    const cardField = document.createElement('button');
    cardField.className = 'game__card';
    cardField.type = 'button';
    cardField.setAttribute('aria-label', `Card ${cardIndex + 1}`);
    cardField.setAttribute('aria-pressed', 'false');
    buildGameCardContent(cardField, cardIndex, cardImagePath);
    gameBoard.appendChild(cardField);
}

function buildGameCardContent(cardField: HTMLButtonElement, cardIndex: number, cardImagePath: string) {
    const cardInner = document.createElement('span');
    cardInner.className = 'game__card-inner';
    const cardFront = createCardFrontFace();
    const cardBack = createCardBackFace(cardIndex, cardImagePath);
    cardInner.append(cardFront, cardBack);
    cardField.appendChild(cardInner);
    attachCardFlipHandler(cardField);
}

function attachCardFlipHandler(cardField: HTMLButtonElement) {
    cardField.addEventListener('click', () => {
        const isFlipped = cardField.classList.toggle('is-flipped');
        cardField.setAttribute('aria-pressed', String(isFlipped));
    });
}

function createCardFrontFace(): HTMLSpanElement {
    const cardFront = document.createElement('span');
    cardFront.className = 'game__card-face game__card-face--front';
    return cardFront;
}

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

function shuffleArray<T>(items: T[]): T[] {
    const shuffledItems = [...items];
    for (let index = shuffledItems.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
    }
    return shuffledItems;
}
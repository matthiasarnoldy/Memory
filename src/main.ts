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

const themeImageMap: Record<string, string> = {
    CodeVibesTheme: '../public/assets/img/codeVibes.png',
    GamingTheme: '../public/assets/img/gaming.png',
    DaProjectsTheme: '../public/assets/img/daProjects.png',
    FoodsTheme: '../public/assets/img/foods.png',
};

function init() {
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
    if (isComplete) {
        playButton.removeAttribute('tabindex');
        return;
    }
    playButton.setAttribute('tabindex', '-1');
}

function saveSettings(values: CompleteSettingsValues) {
    localStorage.setItem('memory.theme', values.theme);
    localStorage.setItem('memory.player', values.player);
    localStorage.setItem('memory.boardSize', values.boardSize);
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
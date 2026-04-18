import type { SettingsValues, CompleteSettingsValues } from './types';
import { DIVIDER_ICON_PATHS, THEME_IMAGE_MAP } from './constants';

/**
 * Initializes the settings page by setting up all interactive elements and summaries.
 */
export function initSettingsPage() {
    initPlayButton();
    initPreviewImage();
    initSelectedSummary();
}

/**
 * Initializes the play button and its event listeners for the settings page.
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
 * Initializes the preview image for the selected theme on the settings page.
 */
function initPreviewImage() {
    const themePreviewImage = document.querySelector<HTMLImageElement>('.options__choosed > img');
    updateThemePreviewImage(themePreviewImage);
}

/**
 * Updates the summary display for the currently selected settings.
 */
function initSelectedSummary() {
    const selectedThemeText = document.querySelector<HTMLElement>('.settings__selected-theme');
    const selectedPlayerText = document.querySelector<HTMLElement>('.settings__selected-player');
    const selectedBoardSizeText = document.querySelector<HTMLElement>('.settings__selected-board-size');
    if (!selectedThemeText || !selectedPlayerText || !selectedBoardSizeText) return;
    updateSelectedSummary(selectedThemeText, selectedPlayerText, selectedBoardSizeText);
}

/**
 * Handles the click event for the play button. Prevents navigation if not all settings are selected.
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
 * Checks if all required settings are selected.
 * @param values The current settings
 * @returns True if all settings are selected
 */
function hasCompleteSelection(values: SettingsValues): values is CompleteSettingsValues {
    return Boolean(values.theme && values.player && values.boardSize);
}

/**
 * Updates the enabled/disabled state of the play button based on the current selection.
 * @param playButton The play button element
 */
function updatePlayButtonState(playButton: HTMLAnchorElement) {
    const checkedValues = getCheckedValue();
    const isComplete = hasCompleteSelection(checkedValues);
    playButtonActions(playButton, isComplete);
}

/**
 * Sets the state and attributes of the play button depending on whether the selection is complete.
 * @param playButton The play button element
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
 * Updates the divider icons depending on the selection state.
 * @param isComplete Whether the selection is complete
 */
function updateSelectedDividerIcons(isComplete: boolean) {
    const dividerIcons = document.querySelectorAll<HTMLImageElement>('.settings__choosed--wrapper img');
    const activeIconPath = isComplete ? DIVIDER_ICON_PATHS.active : DIVIDER_ICON_PATHS.default;
    dividerIcons.forEach((icon) => {
        icon.src = activeIconPath;
    });
}

/**
 * Saves the selected settings to localStorage.
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
    const nextImagePath = THEME_IMAGE_MAP[selectedTheme];
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

export {
    initPlayButton,
    initPreviewImage,
    initSelectedSummary,
    handlePlayButtonClick,
    hasCompleteSelection,
    updatePlayButtonState,
    playButtonActions,
    updateSelectedDividerIcons,
    saveSettings,
    updateThemePreviewImage,
    updateSelectedSummary,
    getCheckedLabelText,
    getCheckedValue
};
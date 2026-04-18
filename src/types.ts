export type SettingsValues = {
    theme: string | null;
    player: string | null;
    boardSize: string | null;
};

export type CompleteSettingsValues = {
    theme: string;
    player: string;
    boardSize: string;
};

export type GridSize = {
    rows: number;
    cols: number;
};

export type PlayerColor = 'orange' | 'blue' | 'tie';

export type ExitConfirmOverride = {
    text?: string;
    back?: string;
    exit?: string;
};
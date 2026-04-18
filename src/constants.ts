import type { GridSize, ExitConfirmOverride } from './types';

export const THEME_IMAGE_MAP: Record<string, string> = {
    CodeVibesTheme: 'assets/img/codeVibes.png',
    GamingTheme: 'assets/img/gaming.png',
    DaProjectsTheme: 'assets/img/daProjects.png',
};

export const DIVIDER_ICON_PATHS = {
    default: 'assets/icons/dividingLine.svg',
    active: 'assets/icons/decorLineRotated.svg',
};

export const BOARD_SIZE_GRID_MAP: Record<string, GridSize> = {
    '16': { rows: 4, cols: 4 },
    '24': { rows: 4, cols: 6 },
    '36': { rows: 6, cols: 6 },
};

export const BOARD_SIZE_GAP_MAP: Record<string, string> = {
    '16': '16px',
    '24': '8px',
    '36': '8px',
};

export const THEME_CLASS_MAP: Record<string, string> = {
    CodeVibesTheme: 'theme--codevibes',
    GamingTheme: 'theme--gaming',
    DaProjectsTheme: 'theme--da-projects',
};

export const THEME_EXIT_OVERRIDE_MAP: Record<string, ExitConfirmOverride> = {
    gaming: { back: 'No, back to game', exit: 'Yes, exit game' },
};

export const THEME_CARD_IMAGE_MAP: Record<string, string[]> = {
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

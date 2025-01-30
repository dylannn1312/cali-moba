import { lightenDarkenColor } from "../utils/color";

const THEME = {
    PRIMARY_COLOR: '#F69525',
    SECONDARY_COLOR: '#FFFFFF',
    TEXT_COLOR: '#000000',
    MUTED_COLOR: '',
    BUTTON_COLOR: 'rgb(229,231,235)',
    BUTTON_HOVER_COLOR: 'rgb(209,213,219)',
};

THEME.MUTED_COLOR = lightenDarkenColor(THEME.TEXT_COLOR, 100);

export { THEME };

// Библиотека для работы, командных матчей ТДМ

import { GameMode } from 'pixel_combats/room';

// Константы, времении
var PARAMETER_GAME_LENGTH = 'default_game_mode_length';

// Длительность матча, выборного для игрока 
export function game_mode_length_seconds() {
    var length = GameMode.Parameters.GetString(PARAMETER_GAME_LENGTH);
    switch (length) {
        case 'Length_КОРОТКАЯ': return 140;; // 1 min
        case 'Length_СРЕДНЯЯ': return 260; // 2 min
        case 'Length_ДЛИННАЯ': return 480; // 3 min
    }
    return 300;
}

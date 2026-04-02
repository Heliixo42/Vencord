/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

let savedStatus: string | null;

const StatusSettings = getUserSettingLazy<string>("status", "status")!;

const settings = definePluginSettings({
    statusToSet: {
        type: OptionType.SELECT,
        description: "Status to set while playing a game",
        options: [
            {
                label: "Online",
                value: "online",
            },
            {
                label: "Idle",
                value: "idle",
            },
            {
                label: "Do Not Disturb",
                value: "dnd",
                default: true
            },
            {
                label: "Invisible",
                value: "invisible",
            }
        ]
    }
});

export default definePlugin({
    name: "AutoDNDWhilePlaying",
    description: "Automatically updates your online status (online, idle, dnd) when launching games",
    authors: [Devs.thororen],
    settings,
flux: {
        RUNNING_GAMES_CHANGE({ games }) {
            const status = StatusSettings.getSetting();
            
            // Definiujemy nazwę gry, która ma aktywować status
            const targetGameName = "Counter-Strike 2"; 

            // Sprawdzamy, czy jakakolwiek z uruchomionych gier pasuje do naszej nazwy
            const isPlayingTargetGame = games.some(game => game.name === targetGameName);

            if (isPlayingTargetGame) {
                // Jeśli gramy w konkretną grę i status nie jest jeszcze ustawiony
                if (status !== settings.store.statusToSet) {
                    savedStatus = status;
                    StatusSettings.updateSetting(settings.store.statusToSet);
                }
            } else if (savedStatus) {
                // Jeśli wyłączyliśmy grę (lub nie ma jej na liście), przywracamy poprzedni status
                StatusSettings.updateSetting(savedStatus);
                savedStatus = null; // Czyścimy zmienną, żeby nie nadpisywać statusu w kółko
            }
        }
    }

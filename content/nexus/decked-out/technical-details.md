---
title: Decked Out - Technical Details
linkTitle: Technical details
tags: [decked-out]
description: 'Plugins and the changes that let Decked Out run as multiplayer instances.'
---
## Plugins

Plugins marked `*` were written by Twist.

### Core

| Plugin | Purpose |
|---|---|
| [MythicDungeons](https://www.spigotmc.org/resources/mythicdungeons.102699/) | The main plugin. Creates an instance of the world for each run, then deletes it once all players have left. Also used for the Vault Hunters April Fools event. |
| [WorldGuard](https://dev.bukkit.org/projects/worldguard) | Grief protection for the main world. |
| CompassSwitcher* | Sets a compass's world to "overworld" when it's dropped and back to the player's dimension when it's picked up, so the dungeon's filters work. |
| [PlotSquared](https://www.spigotmc.org/resources/plotsquared-v7.77506/) | Lets players always claim a board, since the ones in the lobby are limited and unprotected. |
| [ConditionalEvents](https://www.spigotmc.org/resources/conditionalevents-custom-actions-for-specific-events-1-8-1-20-6.82271/) | Custom event actions without writing plugins. |

### Cosmetic

| Plugin | Purpose |
|---|---|
| ServerVariables | Stores server and player variables that can be read through PlaceholderAPI. |
| [Citizens](https://www.spigotmc.org/resources/citizens.13811/) | NPCs in the lobby. |
| [TAB](https://www.spigotmc.org/resources/tab-1-5-1-20-4.57806/) | Shows which dungeon each player is in on the tab list. |
| [DecentHolograms](https://www.spigotmc.org/resources/decentholograms-1-8-1-20-4-papi-support-no-dependencies.96927/) | Floating text around the lobby, including the leaderboards. |
| [EpicRename](https://www.spigotmc.org/resources/epicrename.4341/) | Lets players rename shulker boxes. |
| [ajLeaderboards](https://www.spigotmc.org/resources/ajleaderboards.85548/) | Builds leaderboards from PlaceholderAPI values. |

### Utility

| Plugin | Purpose |
|---|---|
| [EssentialsX](https://essentialsx.net/) + EssentialsXSpawn | Kits, spawn, join messages and so on. |
| [AxShulkers](https://www.spigotmc.org/resources/axshulkers-open-your-shulkers-anywhere.112178/) | Open shulkers without placing them. |
| [InventoryRollbackPlus](https://www.spigotmc.org/resources/inventory-rollback-plus-1-8-1-20-x.85811/) | Inventory backups, so boxes left in a dungeon can be restored. |
| [LuckPerms](https://luckperms.net/) | Permissions, mostly for name colours. |
| [LPC](https://www.spigotmc.org/resources/lpc-chat-formatter-1-7-10-1-20.68965/) | Chat colours from LuckPerms ranks. |
| NoStealingBook* | Stops players taking books from lecterns without permission. |

### Dependencies

| Plugin | Needed by |
|---|---|
| [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/) | Leaderboards, TAB and holograms. |
| [ProtocolLib](https://www.spigotmc.org/resources/protocollib.1997/) | MythicDungeons. |
| [WorldEdit](https://dev.bukkit.org/projects/worldedit) | WorldGuard. |

## Changes from survival

### Nether and End

Both are disabled.

### Compasses

Each run happens in a cloned world with its own name (`deckedout_1` rather than `overworld`), but the compass filters expect the overworld. Fixing this with commands failed in multiplayer because of game limits, so CompassSwitcher rewrites the compass's world whenever it's picked up or dropped.

### Respawning

MythicDungeons uses a shared checkpoint that every player respawns at, which breaks co-op. Instead, command blocks watch for deaths and teleport the player to the respawn point for the team they joined on entry. That means you don't actually need to sleep in the bed.

### Lectern books

MythicDungeons has no option to stop players taking books from lecterns. Taken books can't be put back, and that can softlock the tutorial. NoStealingBook blocks this globally for anyone without permission.

### Leaderboards

The dungeon's redstone was edited to run commands that save each run's stats to ServerVariables. ajLeaderboards reads those values through PlaceholderAPI and ranks them, and DecentHolograms shows the results in the lobby.

### Boards

The lobby has only a few boards. PlotSquared's schematic feature puts the same board on every plot, so every player can claim a protected one.

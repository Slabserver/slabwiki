---
title: "Hurtin' Slabbers - Technical Details"
linkTitle: Technical details
tags: [hurtin-slabbers]
description: "Plugins and implementation notes for the Nexus Hurtin' Slabbers server."
---
## Core Plugins

| Plugin | Purpose |
|---|---|
| [MythicDungeons](https://www.spigotmc.org/resources/mythicdungeons.102699/) | Instances each game session as its own world. Deletes the instance when all players leave. |
| [Parkour](https://www.spigotmc.org/resources/parkour.23685/) | Handles parkour mechanics, checkpoints, and level progression. |
| [UltimateAdvancementAPI](https://github.com/frengor/UltimateAdvancementAPI) | Drives the in-game advancement tracking. |
| [WorldGuard](https://dev.bukkit.org/projects/worldguard) | Block protection for the lobby and level select room. |
| [Advanced Portals](https://www.spigotmc.org/resources/advanced-portals.14356/) | Handles transitions between areas. |
| [Typewriter](https://docs.typewritermc.io/) | NPC dialogue and story delivery. |
| [ItemJoin](https://www.spigotmc.org/resources/itemjoin.12276/) | Gives players specific items on joining the server. |
| [ajLeaderboards](https://www.spigotmc.org/resources/ajleaderboards.85548/) | Live leaderboards in the lobby. |
| [AdvancedDisplays](https://www.spigotmc.org/resources/advanceddisplays.116952/) | Display boards for scores and server info. |
| [SimpleServerSender](https://github.com/CodingTwist/SimpleServerSender) | Sends players back to the proxy on exit. |
| [LuckPerms](https://luckperms.net/) | Permissions. |
| [LPC](https://www.spigotmc.org/resources/lpc-chat-formatter-1-7-10-1-20.68965/) | Chat formatting from LuckPerms ranks. |

## Dependency Plugins

| Plugin | Purpose |
|---|---|
| [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/) | Required by leaderboards and displays. |
| [ProtocolLib](https://www.spigotmc.org/resources/protocollib.1997/) | Required by MythicDungeons. |
| [Vault](https://www.spigotmc.org/resources/vault.34315/) | Economy API, required by some plugins. |
| [FastAsyncWorldEdit](https://www.spigotmc.org/resources/fastasyncworldedit.13932/) | World editing. |
| [ViaVersion](https://www.spigotmc.org/resources/viaversion.19254/) | Cross-version client support. |
| [packetevents](https://github.com/retrooper/packetevents) | Packet handling library. |

## Notes

- The Nether and End are disabled.
- Instancing is handled by MythicDungeons, the same system used in Decked Out. Each session gets a fresh world copy. When the last player leaves, the instance is deleted.
- Saves use level cards that Parkour hands out when you leave a level. They're physical items the player keeps between sessions.
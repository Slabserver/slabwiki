---
title: Spectator Servers - Technical Details
linkTitle: Technical details
tags: [spectator-servers]
description: 'Plugins and implementation notes for the Nexus spectator servers.'
---
## Core Plugins

| Plugin | Purpose |
|---|---|
| ViewOnly | Blocks all block placement and breaking across all worlds. |
| NoClip | Custom plugin. Lets players move through blocks. |
| [F3NPerm](https://www.spigotmc.org/resources/f3nperm.105142/) | Controls access to the F3+N gamemode switch. Keeps players in the correct mode. |
| [DeluxeMenus](https://www.spigotmc.org/resources/deluxemenus.11734/) | Powers the in-hand navigation menu for world selection and teleportation. |
| [ItemJoin](https://www.spigotmc.org/resources/itemjoin.12276/) | Gives players the menu item on join and world switch. |
| LecternRead | Allows players to read lectern books without taking them. |
| Archive-Cleanmobs | Custom plugin. Freezes Mobs in Place. |
| MountHer | Custom plugin. Mount support. |
| [SimpleServerSender](https://github.com/Slabserver/SimpleServerSender) | Custom plugin. Transfer to other servers on the Slab network |
| [LuckPerms](https://luckperms.net/) | Permissions. |
| [LPC](https://www.spigotmc.org/resources/lpc-chat-formatter.68965/) | Chat formatting from LuckPerms ranks. |
| [EssentialsX](https://essentialsx.net/) | Utility commands, fly, and spawn handling. |
| [ViaVersion](https://www.spigotmc.org/resources/viaversion.19254/) | Cross-version client support. |


## Dependency Plugins

| Plugin | Purpose |
|---|---|
| [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/) | Required by DeluxeMenus. |
| [WorldEdit](https://dev.bukkit.org/projects/worldedit) | Available for admin use. |

## Notes

- All worlds are loaded read-only. ViewOnly enforces this at the plugin level, not just through permissions.
- Lectern books stay in place. LecternRead lets players open and read them without picking them up.
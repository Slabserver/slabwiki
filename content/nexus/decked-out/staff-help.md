---
title: Decked Out - Staff Help
linkTitle: Staff help
tags: [decked-out]
description: 'How staff restore lost boxes, whitelist players and fix broken Decked Out runs.'
---
## Restoring a lost box

The most common problem: a player places their box in the dungeon, then leaves the game for 5 minutes or exits without it. The world is an instance, so when it's deleted, the box goes with it.

[InventoryRollbackPlus](https://www.spigotmc.org/resources/inventory-rollback-plus-1-8-1-20-x.85811/) takes snapshots of player inventories. Run `/irp restore (playername)` and follow the menu.

> **Shulkers restore empty unless you dupe them in creative.** This is because of the dupe protection in [AxShulkers](https://www.spigotmc.org/resources/axshulkers-open-your-shulkers-anywhere.112178/).

## Whitelisting

With the vanilla whitelist, admins (light red name) can run `/whitelist add (playername)`.

## Moderation

Admins can ban, mute, invsee, change gamemode, teleport and use plot admin commands. Contact Twist if you need more help.

## Boards

Players need to run `/kit board` to get the items for their board. This is easy to miss, so point new players to it.

## Fixing broken runs

### Co-op player went through the wrong door

Either switch to spectator mode, teleport to the affected players and walk through the open door to end the game, **or** have the player who left through the wrong door run `/stuck`. It puts them at the correct bed and ends the game.

### Anything else

If the dungeon breaks and a player can't get their box back, use the **force reset** button to stop the game. Grab the box and leave.

> **Only use force reset if the dungeon really is broken,** and let Twist know when and why you used it.

## Notes

- If a player leaves a dungeon, they have 5 minutes to log back in before the instance is deleted.
- The server can handle about 30 players with 10 tutorials and 6-7 Decked Out runs going at once, but it struggles at that point (around 45 MSPT).

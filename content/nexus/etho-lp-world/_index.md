---
title: Etho LP World
icon: clock
description: "Travel through time in Etho's Let's Play world"
infobox:
  image: '/images/articles/etho-lp-now.jpg'
  Type: 'archive'
  Server: 'Nexus'
  Episodes: '1-550'
  Status: 'Live'
---
The **Etho LP World** server lets you explore Etho's Let's Play world at any point in the [series](https://www.youtube.com/watch?v=v41aZQhOcfI&list=PLaAVDbMg_XArcet5lwcRo12Fh9JrGKydh) (season 2). Each download that has been released has its own snapshot, so you can jump back in time and view {{< years-since "2011-09-30" >}} years of history.

{{< compare before="/images/articles/etho-lp-ep364.jpg" after="/images/articles/etho-lp-now.jpg" alt="The same spot in Ep 364 and in the present day" >}}

Thank you to https://ethoslab.world/ for archiving the worlds and making this possible.

## How It Works

When you join, you get a menu item in your hotbar. Use it to pick an episode and your personal chunks change. Which means other players can all see different worlds.

- The action bar shows the episode number, its name and the date it was uploaded.
- Run `/now` to return to the present day or use the {{< mcicon "clock" >}} GUI.

## Exploring

- You can change gamemode and toggle flight on and off.
- No-clip lets you pass through blocks to get inside builds (only works in the latest snapshot). 
- You can break blocks, but nothing is saved. Each snapshot always goes back to how it was in that episode. Though please be mindful of other players who are actually exploring.

## Under the Hood

The server doesn't load all the separate worlds. A custom packet-level plugin sends each player the chunks from their chosen snapshot as fake chunks. [ItemJoin](https://modrinth.com/plugin/itemjoin) gives the hotbar items, and a custom Paper fork disables world saving.

This did mean the worlds needed to be converted to the latest Minecraft version as far back as Beta 1.9, which has created some block state issues. The lighting was rebaked to match the original worlds for example the transparent piston Etho used a lot of.

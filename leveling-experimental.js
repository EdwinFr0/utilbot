import "dotenv/config";
import { Client, GatewayIntentBits, MessageEmbed, MessageAttachment } from "discord.js";
import QuickDB from "quick.db";
import canvacord from "canvacord";
import fs from "node:fs";
import isNumber from "is-number";

const bot = new Client({
  intents: [
    GatewayIntentBits.GUILD_MESSAGES,
    GatewayIntentBits.GUILD_MEMBERS,
    GatewayIntentBits.GUILD_MESSAGE_REACTIONS,
    GatewayIntentBits.GUILD_PRESENCES,
  ],
});

const db = new QuickDB({ filePath: "./levels.db" });

const recentChatters = new Set();
const prefix = ".";

const minXp = 15;
const maxXp = 25;

function xpNeeded(level) {
  let xp = 100;
  for (let i = 0; i < level; i++) {
    xp += 55 + 10 * i;
  }
  return xp;
}

bot.on("ready", async () => {
  console.log("Bot ready");
});

bot.on("messageCreate", async (message) => {
  if (message.channel.type === "dm" || message.author.bot) {
    return;
  }

  const authorId = message.author.id;

  if (recentChatters.has(authorId)) {
    return;
  }

  const xpToAdd = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;

  let user = await db.get(authorId);
  if (!user) {
    user = { level: 0, xp: xpToAdd, allXp: xpToAdd };
    await db.set(authorId, user);
  } else {
    user.xp += xpToAdd;
    user.allXp += xpToAdd;
    if (user.xp >= xpNeeded(user.level)) {
      user.xp -= xpNeeded(user.level);
      user.level++;
    }
    await db.set(authorId, user);
  }

  recentChatters.add(authorId);
  setTimeout(() => {

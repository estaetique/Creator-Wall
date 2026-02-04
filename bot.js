import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// 🎬 Mentor TikTok Usernames
const mentors = [
  "natminsi",
  "estaetique",
  "star4jin",
  "daphxaep",
  "honeyjoonie",
  "_jkszn",
  "k.topiaedits",
  "alxvante",
  "sunaevii",
  "taex.guk",
  "oh.kook_7",
  "taekerrr",
  "jungkookie.aep",
  "chromakoo"
];

const PURPLE = 0x5200a3; // your custom embed side color 💜

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let messageOne = null;
let messageTwo = null;

// 🔍 Fetch TikTok public data
async function fetchTikTok(username) {
  try {
    const res = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const text = await res.text();

    const followers = text.match(/"followerCount":(\d+)/)?.[1];
    const likes = text.match(/"heartCount":(\d+)/)?.[1];
    const avatar = text
      .match(/"avatarLarger":"(.*?)"/)?.[1]
      ?.replace(/\\u002F/g, "/");

    if (!followers || !likes) return null;

    return {
      followers: Number(followers).toLocaleString(),
      likes: Number(likes).toLocaleString(),
      avatar
    };
  } catch {
    return null;
  }
}

// ✨ Stylish Embed Card
function createEmbed(username, stats) {
  return new EmbedBuilder()
    .setColor(PURPLE)
    .setAuthor({
      name: `🎬 @${username}`,
      url: `https://www.tiktok.com/@${username}`
    })
    .setThumbnail(stats.avatar || null)
    .setDescription(
      `✨ **TikTok Creator Profile**\n\n` +
      `👥 **Followers**: \`${stats.followers}\`\n` +
      `❤️ **Total Likes**: \`${stats.likes}\`\n` +
      `🔗 **Profile**: [Click to View](https://www.tiktok.com/@${username})`
    )
    .setFooter({ text: "Editing World • Mentor Creator Board" });
}

// 🔁 Update messages
async function updateBoard() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) return;

  const embedsOne = [];
  const embedsTwo = [];

  for (let i = 0; i < mentors.length; i++) {
    const stats = await fetchTikTok(mentors[i]);

    const embed = stats
      ? createEmbed(mentors[i], stats)
      : new EmbedBuilder()
          .setColor(PURPLE)
          .setTitle(`🎬 @${mentors[i]}`)
          .setDescription("⚠️ Couldn’t fetch stats right now.\nWill retry on next update.")
          .setFooter({ text: "Editing World • Mentor Creator Board" });

    if (i < 7) embedsOne.push(embed);
    else embedsTwo.push(embed);
  }

  if (!messageOne) messageOne = await channel.send({ embeds: embedsOne });
  else await messageOne.edit({ embeds: embedsOne });

  if (!messageTwo) messageTwo = await channel.send({ embeds: embedsTwo });
  else await messageTwo.edit({ embeds: embedsTwo });
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateBoard();
  setInterval(updateBoard, 10 * 60 * 1000);
});

client.login(TOKEN);

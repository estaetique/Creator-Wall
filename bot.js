import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PURPLE = 0x5200a3;

const mentors = [
  { username: "natminsi", bio: "creator of this space 🤍\nediting since 2022 · ae since 2023\nk-pop obsessed & here to help beginners grow\neveryone starts somewhere — it gets easier with time", instagram: "natminsi" },

  { username: "estaetique", bio: "head admin · editor mentor\nediting since 2022 · army since 2013\nvisual edits, audio help & bts talk\nno gatekeeping, just growth 🤍", instagram: "estaetique_" },

  { username: "star4jin", bio: "bts-inspired editor ✨\ncreative edits & aesthetic vibes\nalways learning, always growing\nhappy to help when I can 🤍", instagram: "star4jin" },

  { username: "daphxaep", bio: "editing since 2020\ncapcut · funimate · alight motion · ae\nbts-inspired editor, always happy to help\nespecially with ae 🤍", instagram: "" },

  { username: "honeyjoonie", bio: "editing bts since 2021\ncapcut → after effects\narmy since 2019\nalways open to questions & help 🫶", instagram: "honeyjooniee" },

  { username: "_jkszn", bio: "editing since 2022 · ae since 2024\neditor mentor · army since 2021\nhere for ae help or edit talks 💗", instagram: "_jkszn" },

  { username: "k.topiaedits", bio: "editing for 4 years · from belgium\narmy since 2022\nloves k-pop, dancing & chaos 😭\nprobably rewatching the same clip again", instagram: "k.topiaedits" },

  { username: "alxvante", bio: "ae editor · mentor\nstill close to the beginner stage\nhere to support, guide & grow together 💜\nbts-inspired", instagram: "alxvante7" },

  { username: "sunaevii", bio: "editing since 2020 · ae since 2021\nbts & blackpink edits\narmy & blink\nalways open to questions or chats 😋", instagram: "sunaeviii" },

  { username: "taex.guk", bio: "editing since 2021\ncapcut · videostar · ae\narmy since 2020\nlearning every day & happy to help 💗", instagram: "taex.guk" },

  { username: "oh.kook_7", bio: "editing since 2023\ncapcut & video star\nloves helping others 🫶\ndon’t be shy", instagram: "oh.kook__7" },

  { username: "taekerrr", bio: "editing for 9 years\nalight motion mentor\narmy for 6 years\nhere to help & support everyone 🫂", instagram: "taekerrr_" },

  { username: "jungkookie.aep", bio: "ae editor since 2019\neditor mentor · bts edits\nfailed, improved, found a style ✨\nae breakdowns are mandatory 😭", instagram: "jungkookie.aep" },

  { username: "chromakoo", bio: "creative editor & mentor\nbts-inspired edits\nfocused on growth, style & storytelling\nalways open to helping others 💜", instagram: "chromakoo" }
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let messageOneId = null;
let messageTwoId = null;

async function fetchTikTok(username) {
  try {
    const res = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const text = await res.text();

    const followers = text.match(/"followerCount":(\d+)/)?.[1];
    const likes = text.match(/"heartCount":(\d+)/)?.[1];
    const avatar = text.match(/"avatarLarger":"(.*?)"/)?.[1]?.replace(/\\u002F/g, "/");

    return {
      followers: followers ? Number(followers).toLocaleString() : "—",
      likes: likes ? Number(likes).toLocaleString() : "—",
      avatar
    };
  } catch {
    return { followers: "—", likes: "—", avatar: null };
  }
}

function createEmbed(mentor, stats) {
  let links = `[🎬 TikTok](https://www.tiktok.com/@${mentor.username})`;
  if (mentor.instagram) links += ` • [📸 Instagram](https://instagram.com/${mentor.instagram})`;

  return new EmbedBuilder()
    .setColor(PURPLE)
    .setAuthor({ name: `🎬 @${mentor.username}`, url: `https://www.tiktok.com/@${mentor.username}` })
    .setThumbnail(stats.avatar || null)
    .setDescription(
      `✨ *${mentor.bio}*\n\n` +
      `👥 **Followers**: \`${stats.followers}\`\n` +
      `❤️ **Likes**: \`${stats.likes}\`\n\n` +
      `${links}`
    )
    .setFooter({ text: "Editing World • Mentor Creator Board" });
}

async function updateBoard() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) return;

  const embedsOne = [];
  const embedsTwo = [];

  for (let i = 0; i < mentors.length; i++) {
    const stats = await fetchTikTok(mentors[i].username);
    const embed = createEmbed(mentors[i], stats);

    if (i < 7) embedsOne.push(embed);
    else embedsTwo.push(embed);
  }

  if (!messageOneId) {
    const msg = await channel.send({ embeds: embedsOne });
    messageOneId = msg.id;
  } else {
    const msg = await channel.messages.fetch(messageOneId);
    await msg.edit({ embeds: embedsOne });
  }

  if (!messageTwoId) {
    const msg = await channel.send({ embeds: embedsTwo });
    messageTwoId = msg.id;
  } else {
    const msg = await channel.messages.fetch(messageTwoId);
    await msg.edit({ embeds: embedsTwo });
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateBoard();
  setInterval(updateBoard, 10 * 60 * 1000);
});

client.login(TOKEN);

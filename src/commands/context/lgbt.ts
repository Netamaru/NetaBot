import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import type { ContextCommand } from "../../lib/types";
import { avatarCdnUrl } from "../../lib/discord-urls";

const RAINBOW_IMAGES = [
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731944438124594/319912889_647579577155913_2109893168806806036_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731944744292414/319917310_6346550625373069_6465797923545484322_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731945004343316/320074222_702006918128117_1524572312012223209_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731945331511326/320231279_921123809301136_8775681459488466263_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731945570570240/320244650_469783288561645_5441355523133432565_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731945868369950/320432910_895213848181532_2322559469782039822_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731946099069060/320440094_658640115992638_7003771376284060717_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731946300379166/320542901_3761497577403809_8927035850914128219_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731946518487080/319854975_524739939622660_4681284401943432821_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731946778546218/319888828_1239010573638016_3908569098969605296_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731980395876352/321553999_725672725645694_8932204003249922570_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731980651737189/320551198_858309765501278_7827486445694012084_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731980874027090/320786727_1117992718897726_5671388745708990941_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731981087944754/321125161_681918376799609_6959052926616169247_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731981385732126/321280409_473337904971702_6274909517490464203_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731981645791352/321466311_810586706707556_8152758791781913679_n.jpg",
  "https://cdn.discordapp.com/attachments/857674223295266886/1055731981863882752/321503103_478407617738463_4777585409615553479_n.jpg",
];

const lgbt: ContextCommand = {
  id: "lgbt",
  discordName: "lgbt?",
  async execute(interaction: MessageContextMenuCommandInteraction) {
    const target = interaction.targetMessage;
    const msgLink = `https://discord.com/channels/${target.guildId}/${target.channelId}/${target.id}`;
    const attachment = target.attachments.first()?.url;

    const replyEmbed = new EmbedBuilder()
      .setAuthor({
        name: target.author.displayName,
        iconURL: avatarCdnUrl(target.author.id, target.author.avatar, 128),
        url: msgLink,
      })
      .setDescription(`**[Reply to:](${msgLink})** ${target.content}`)
      .setImage(attachment ?? null);

    const imageEmbed = new EmbedBuilder().setImage(
      RAINBOW_IMAGES[Math.floor(Math.random() * RAINBOW_IMAGES.length)]!,
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Open Original Message")
        .setStyle(ButtonStyle.Link)
        .setURL(msgLink),
    );

    await interaction.reply({
      embeds: [imageEmbed, replyEmbed],
      components: [row],
    });
  },
};

export default lgbt;

const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const logChannels = new Keyv(process.env.logChannels);
const { getRoleColor } = require('../../Utils/getRoleColor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription(`Submits a report to the staff's logs channel.`)
    .addUserOption((option) => option
      .setName('user')
      .setDescription(`The user that is breaking a rule.`)
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('offense')
      .setDescription(`The rule that the user broke.`)
      .setRequired(true)
    ),
  guildOnly: true,
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const report = interaction.options.getString('offense');
    const logChName = await logChannels.get(`logchannel_${interaction.guild.id}`);
    const log = interaction.guild.channels.cache.find((ch) => ch.name === `${logChName}`);
    if (!log) {
      interaction.reply({ content: `Looks like the server doesn't have any logs channel. Please ask a staff member to setup one using /setlogschannel`, ephemeral: true });
    }

    let color = getRoleColor(interaction.guild);
    const reportEmbed = new MessageEmbed()
      .setColor(#8B0000)
      .setTitle(`New Report`)
      .setThumbnail(`https://i.imgur.com/YqM9tbt.png`)
      .addFields(
        { name: 'Submitted by:', value: `${interaction.member.user.username}`, inline: true },
        { name: 'Defendant:', value: `${member}`, inline: true },
        { name: 'Offense', value: `${report}`, inline: true }
      )
      .setTimestamp();
    log.send({ embeds: [reportEmbed] });
    interaction.reply({ content: `${member} has been successfully reported to the server's staff.`, ephemeral: true });
  }
}
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getRoleColor } = require('../../Utils/getRoleColor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription(`Checks how many servers the bot is in.`),
  async execute(interaction) {
    let color = getRoleColor(interaction.guild);
    if (interaction.guild.me.roles.highest.color === 0) color = '#b9bbbe';
    else color = interaction.guild.me.roles.highest.color;
    let membercount = 0;
    interaction.client.guilds.cache.forEach((guild) => membercount += guild.memberCount);
    const infoEmbed = new MessageEmbed()
      .setColor(`#FFD700`)
      .setTitle('Bot info')
      .addFields(
        { name: 'Server Count', value: interaction.client.guilds.cache.size.toString(), inline: true },
        { name: 'User Count', value: membercount.toString(), inline: true },
        { name: `Release Version`, value: `1.0.0`, inline: true}     
      )
      .setFooter(`Any issues? Feel free to submit a report with /bugreport!`)
      .setTimestamp();
    interaction.reply({ embeds: [infoEmbed] });
  }
}
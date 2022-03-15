const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const bannedUsers = new Keyv(process.env.bannedUsers);
const { getRoleColor } = require('../../Utils/getRoleColor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('baninfo')
    .setDescription(`View details about a banned user.`)
    .addStringOption((option) => option
      .setName('user')
      .setDescription('The user that you want to view information about his ban.')
      .setRequired(true)
    ),
  requiredPerms: ['BAN_MEMBERS'],
  async execute(interaction) {
    const username = interaction.options.getString('user');
    const bannedUsersArr = await bannedUsers.get(interaction.guild.id);
    let bannedUser;
    if (bannedUsersArr) bannedUser = bannedUsersArr.find((user) => user.username === username);
    if (!bannedUser) {
      return interaction.reply({ content: `${username} isn't banned.` });
    }

    let color = getRoleColor(interaction.guild);
    const banInfoEmbed = new MessageEmbed()
      .setColor(`#a4883b`)
      .setTitle(`Ban Information`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: `Defendant's name:`, value: username , inline: true },
        { name: `Issued by:`, value: bannedUser.author , inline: true }
      )
      .setFooter(`Any issues? Feel free to submit a report with /bugreport!`) 
      .setTimestamp();
    if (bannedUser.reason) banInfoEmbed.addField('Reason:', bannedUser.reason);
    if (bannedUser.unbanDate) {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const daysRemaining = Math.ceil((bannedUser.unbanDate - Date.now()) / millisecondsPerDay);
      banInfoEmbed.addField('Days Remaining:', daysRemaining.toString());
    }
    await interaction.reply({ embeds: [banInfoEmbed] });
  }
}
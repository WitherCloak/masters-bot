const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getRoleColor } = require('../../Utils/getRoleColor');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription(`Bulk deletes a certain amount of messages.`)
    .addIntegerOption((option) => option
      .setName('amount')
      .setDescription(`The number of messages you want to delete.`)
      .setRequired(true)
    ),
  requiredPerms: ['MANAGE_MESSAGES'],
  botRequiredPerms: ['MANAGE_MESSAGES'],
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (amount < 2 || amount > 100) {
      return interaction.reply({ content: `You must enter a number higher than 1 and less than 100.`, ephemeral: true });
    }

    interaction.channel.bulkDelete(amount, true);
    let color = getRoleColor(interaction.guild);
    const clearEmbed = new MessageEmbed()
      .setColor(color)
      .setTitle(`Cleared Messages`)
      .addFields(
        { name: 'Cleared by:', value: `${interaction.member.user.username}` },
        { name: 'Amount of Messages Deleted:', value: `${amount}` },
        { name: 'Channel:', value: `${interaction.channel.name}` }
      )
      .setFooter(`Any issues? Please contact an Admin by opening a support ticket or DM wither#7777.`) 
      .setTimestamp();
    sendLog(interaction, clearEmbed);
  }
}
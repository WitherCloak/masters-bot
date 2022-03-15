const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const warnings = new Keyv(process.env.wrns);
const { getRoleColor } = require('../../Utils/getRoleColor');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription(`Sends a warning message to a user.`)
    .addUserOption((option) => option
      .setName('user')
      .setDescription(`The user that you want to warn.`)
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('reason')
      .setDescription(`The reason that you're warning the user for.`)
      .setRequired(true)
    ),
  requiredPerms: ['KICK_MEMBERS'],
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    const author = interaction.member.user.username;
    if (member.id == interaction.member.user.id) {
      return interaction.reply({ content: `You can't warn youself 5head`, ephemeral: true });
    }

    if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
      return interaction.reply({ content: `Your roles must be higher than the roles of the person you want to ban!`, ephemeral: true });
    }

    let warns = await warnings.get(`warns_${member.id}_${interaction.guild.id}`);
    if (!warns) warns = 1;
    else warns++;
    let color = getRoleColor(interaction.guild);
    const warnEmbed = new MessageEmbed()
      .setColor(#8B0000)
      .setTitle(`Warn Information`)
      .setThumbnail(`https://i.imgur.com/YqM9tbt.png`)
      .addFields(
        { name: `Defendant's name:`, value: `${member.user.tag}`, inline: true },
        { name: `Issued by:`, value: `${author}`, inline: true },
        { name: 'Reason:', value: `${reason}` inline: true }
      )
      .setFooter(`Any issues? Please contact an Admin by opening a support ticket or DM wither#7777.`)
      .setTimestamp();
    await sendLog(interaction, warnEmbed);
    await member.user.send({ content: `${author} is warning you in ${interaction.guild.name} for ${reason}.` });
    await warnings.set(`warns_${member.user.id}_${interaction.guild.id}`, warns);
  }
}
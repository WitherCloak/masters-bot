const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Keyv = require('keyv');
const mts = new Keyv(process.env.mts);
const mutedMembers = new Keyv(process.env.mutedMembers);
const punishments = new Keyv(process.env.punishments);
const { getRoleColor } = require('../../Utils/getRoleColor');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription(`Restricts a user from sending messages.`)
    .addUserOption((option) => option
      .setName('user')
      .setDescription(`The user that you want to mute.`)
      .setRequired(true)
    )
    .addNumberOption((option) => option
      .setName('minutes')
      .setDescription(`How long the user will stay muted for (minutes)`)
      .setRequired(true)
    )
    .addStringOption((option) => option
      .setName('reason')
      .setDescription(`The reason you're muting this user for.`)
    ),
  requiredPerms: ['KICK_MEMBERS'],
  botRequiredPerms: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const mins = interaction.options.getNumber('minutes');
    const reason = interaction.options.getString('reason');
    const author = interaction.member.user.username;
    let mutedRole = interaction.guild.roles.cache.find((r) => r.name === 'Muted Member');
    if (mins > 720 || mins <= 0) {
      return interaction.reply({ content: `Minutes must be a positive number lower than 720.`, ephemeral: true });
    }

    if (member.id == interaction.member.user.id) {
      return interaction.reply({ content: `You can't mute youself 5head`, ephemeral: true });
    }

    if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
      return interaction.reply({ content: `Your roles must be higher than the roles of the person you want to mute!`, ephemeral: true });
    }

    let mutes = await mts.get(`mutes_${member.id}_${interaction.guild.id}`);
    if (!mutes) mutes = 1;
    else mutes = mutes + 1;

    if (!mutedRole) {
      const newMutedRole = await interaction.guild.roles.create({
        name: 'Muted Member',
        permissions: []
      });
      interaction.guild.channels.cache.forEach(async (channel) => {
        await channel.permissionOverwrites.edit(newMutedRole, {
          'SEND_MESSAGES': false,
          'ADD_REACTIONS': false,
          'SPEAK': false
        });
      });
      mutedRole = newMutedRole;
    }

    if (member.roles.cache.has(mutedRole.id)) {
      return interaction.reply({ content: `${user.username} is already muted!`, ephemeral: true });
    }

    await mts.set(`mutes_${member.id}_${interaction.guild.id}`, mutes);
    member.roles.add(mutedRole);
    let color = getRoleColor(interaction.guild);
    const muteEmbed = new MessageEmbed()
      .setColor(`#8B0000`)
      .setTitle(`Mute Information`)
      .setThumbnail(`https://i.imgur.com/YqM9tbt.png`)
      .addFields(
        { name: `Defendant's name:`, value: `${member.user.tag}`, inline: true },
        { name: `Issued by:`, value: `${author}`, inline: true },
        { name: `Duration:`, value: `${mins} minutes`, inline: true },
      )
      .setFooter(`Any issues? Please contact an Admin by opening a support ticket or DM wither#7777.`)
      .setTimestamp();
    const millisecondsPerMinute = 60 * 1000;
    let MuteInfo = {};
    MuteInfo.userID = member.id;
    MuteInfo.unmuteDate = Date.now() + mins * millisecondsPerMinute;
    MuteInfo.author = author;
    let msg = `**${author}** has muted you from ${interaction.guild.name}. **Duration:** ${mins} minutes.`;
    if (reason) {
      muteEmbed.addField('Reason', reason);
      msg += ` Reason: ${reason}.`;
      MuteInfo.reason = reason;
    }

    if (!member.user.bot) member.send({ content: msg });
    let mutedMembersArr = await mutedMembers.get(interaction.guild.id);
    let guilds = await punishments.get('guilds');
    if (!mutedMembersArr) mutedMembersArr = [];
    if (!guilds.includes(interaction.guild.id)) guilds.push(interaction.guild.id);
    mutedMembersArr.push(MuteInfo);
    await mutedMembers.set(interaction.guild.id, mutedMembersArr);
    await punishments.set('guilds', guilds);
    await sendLog(interaction, muteEmbed);
  }
}

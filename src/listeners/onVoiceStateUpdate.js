import { Listener } from "@sapphire/framework";
import {
    CategoryChannel,
    ChannelType,
    GuildMember,
    VoiceChannel,
    VoiceState
} from "discord.js";

/**
 * Event listener for voiceStateUpdate event
 */
export class VoiceStateUpdateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: false,
            event: 'voiceStateUpdate'
        });
    }

    /**
     * Create a new voice channel
     * @param {CategoryChannel} categoryChannel 
     * @param {GuildMember} member 
     */
    async createChannel(categoryChannel, channelName) {
        return await categoryChannel.children.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            reason: 'Automatically created by Channel Creator.'
        })
        .catch(error => {
            this.container.logger.error(`Failed to create channel.`, error);
        });
    }

    /**
     * Delete a channel
     * @param {VoiceChannel} channel 
     */
    async deleteChannel(channel) {
        channel.delete('Channel is empty.')
        .catch(error => {
            this.container.logger.error(`Failed to delete channel '${channel.name}'.`, error);
        });
    }

    /**
     * Handle oldState values for current event
     * @param {VoiceState} state 
     */
    async handleOldState(state) {
        const { channel } = state;
        if (channel?.parent?.name.toUpperCase() === 'VOICE' && channel.name.toUpperCase() !== 'CHANNEL CREATOR' && channel.members.size === 0) {
            // no members left in channel - delete channel
            this.deleteChannel(channel);
        }
    }

    /**
     * Handle newState values for current event
     * @param {VoiceState} state 
     */
    async handleNewState(state) {
        // Only respond to 'Channel Creator' join
        if (state.channel.name !== 'Channel Creator') {
            return;
        }

        const categoryChannel = state.guild.channels.cache.find(channel => channel.type === ChannelType.GuildCategory && channel.name.toUpperCase() === 'VOICE');
        if (categoryChannel == null) {
            this.container.logger.error(`Failed to find Voice category channel.`);
            return;
        }

        const channelName = `${state.member.displayName}'s Room`.replace("s's", "s'"); // handle xxxs's Room
        const channel = await this.createChannel(categoryChannel, channelName);
        if (channel != null) {
            state.setChannel(channel)
            .catch(error => {
                this.container.logger.error(`Failed to move ${state.member.displayName} to new channel.`, error);
            });
        }
    }

    /**
     * Event Listener
     * @param {VoiceState} oldState Previous voice state
     * @param {VoiceState} newState Current voice state
     */
    async run(oldState, newState) {
        if (oldState && oldState.channel) {
            this.handleOldState(oldState);
        }

        if (newState && newState.channel) {
            this.handleNewState(newState);
        }
    }
}
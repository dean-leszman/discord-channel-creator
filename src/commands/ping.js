import { Command } from "@sapphire/framework";

export class PingCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ping',
            description: 'Pong!'
        })
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            return builder.setName(this.name)
                .setDescription(this.description);
        }, {
            idHints: ['1160912136940294164']
        });
    }

    chatInputRun(interaction) {
        return interaction.reply({
            content: 'Pong!'
        });
    }
}
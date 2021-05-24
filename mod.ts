import * as slash from "https://raw.githubusercontent.com/harmonyland/harmony/main/deploy.ts";

// Pick up TOKEN and PUBLIC_KEY from ENV.
slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  youtube: {
    id: "755600276941176913",
    name: "YouTuber",
  },
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
  chess: {
    id: "832012586023256104",
    name: "Xadrez",
  },
};

// Create Slash Commands if not present
slash.commands.all().then((e) => {
  if (e.size !== 2) {
    slash.commands.bulkEdit([
      {
        name: "atividade",
        description: "Começa uma Atividade.",
        options: [
          {
            name: "canal",
            type: slash.SlashCommandOptionType.CHANNEL,
            description: "Canal de voz que a atividade começará.",
            required: true,
          },
          {
            name: "atividade",
            type: slash.SlashCommandOptionType.STRING,
            description: "Atividade.",
            required: true,
            choices: Object.entries(ACTIVITIES).map((e) => ({
              name: e[1].name,
              value: e[0],
            })),
          },
        ],
      },
    ]);
  }
});

slash.handle("atividade", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("canal");
  const atividade = ACTIVITIES[d.option<string>("atividade")];
  if (!channel || !atividade) {
    return d.reply("Invalid interaction.", { ephemeral: true });
  }
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Activities can only be started in Voice Channels.", {
      ephemeral: true,
    });
  }

  slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: atividade.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      d.reply(
        `[Click here to start ${atividade.name} in ${channel.name}.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.log("Erro", e);
      d.reply("Erro ao começar a atividade.", { ephemeral: true });
    });
});

// Handle for any other commands received.
slash.handle("*", (d) => d.reply("Comando não suportado", { ephemeral: true }));
// Log all errors.
slash.client.on("interactionError", console.log);

const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	SlashCommandBuilder,
} = require("discord.js");
const userModel = require("../util/Models/userModel");
const speechBubbles = require("../data/speechbubbles.json");
const timeStamp = require("../util/timeStamp");
const variables = require("../data/variableNames");
const checkPetStatus = require("../util/eventChecks");

function getPetSounds(userDb) {
	const petTypeStrMap = {
		1: "dog",
		2: "cat",
		3: "redPanda",
	};

	const petTypeStr = petTypeStrMap[userDb.petType];
	if (!petTypeStr) {
		console.error("Invalid pet type:", userDb.petType);
		return null;
	}

	const randomPetSound =
		speechBubbles[petTypeStr][
			Math.floor(Math.random() * speechBubbles[petTypeStr].length)
		];

	return {
		petTypeStr,
		randomPetSound
	};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("exercise")
		.setDescription("Interact with your pet!")
		.addSubcommand((subcommand) =>
			subcommand.setName("walk").setDescription("Take your pet for a walk")
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("run").setDescription("Take your pet for a run")
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("hunt").setDescription("Take your pet hunting")
		),

	async execute(interaction) {
		const userDb = await userModel.findOne({
			userId: interaction.user.id
		});

		if (!userDb || userDb.petType === 0) {
			await interaction.reply("You don't have a pet to interact with!");
			return;
		}

		const petName = userDb.petName || "Your pet";
		const subcommand = interaction.options.getSubcommand();
		const now = Date.now();
		const {
			petTypeStr,
			randomPetSound
		} = getPetSounds(userDb);
		if (!petTypeStr) {
			await interaction.reply("There was an error with your pet type.");
			return;
		}

		const canContinue = await checkPetStatus(interaction, userDb, petName, now);
		if (!canContinue) {
			return;
		}

		switch (subcommand) {
			case "walk":
				await handleWalk(interaction, userDb, petName, now, randomPetSound);
				break;
			case "run":
				await handleRun(interaction, userDb, petName, now, randomPetSound);
				break;
			case "hunt":
				await handleHunt(interaction, userDb, petName, now, randomPetSound);
				break;
		}
		await userDb.save();
	},
};

async function handleWalk(interaction, userDb, petName, now, randomPetSound) {
	const lastWalkedArray = userDb.actionTimeStamp.lastWalked;
	const lastWalked =
		lastWalkedArray.length > 0 ?
		new Date(lastWalkedArray[lastWalkedArray.length - 1]) :
		null;
	const lastRanArray = userDb.actionTimeStamp.lastRan;
	const lastRan =
		lastRanArray.length > 0 ?
		new Date(lastRanArray[lastRanArray.length - 1]) :
		null;

	if (
		(lastWalked && now - lastWalked.getTime() < timeStamp.oneHour()) ||
		(lastRan && now - lastRan.getTime() < timeStamp.oneHour())
	) {
		const timeRemaining = Math.max(
			lastWalked ? timeStamp.oneHour() - (now - lastWalked.getTime()) : 0,
			lastRan ? timeStamp.oneHour() - (now - lastRan.getTime()) : 0
		);
		const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
		await interaction.reply({
			content: `Please wait ${remainingMinutes} minute(s). ${petName} is still tired from the last activity.`,
		});
		return;
	}

	userDb.actionTimeStamp.lastWalked.push(new Date(now));
	if (userDb.actionTimeStamp.lastWalked.length > 5) {
		userDb.actionTimeStamp.lastWalked.shift();
	}

	let energyDecreasePercentage = Math.random() * 7 + 5;
	let affectionIncrease = 2;
	let happinessIncrease = 2;
	let description = `It was refreshing and enjoyable. ${petName} is looking happier!`;

	if (userDb.petType === 2) {
		// If the pet is a cat
		energyDecreasePercentage *= 1.5; // Increase energy drain for cats
		affectionIncrease = Math.floor(Math.random() * 5) - 7; // Random decrease for cats
		happinessIncrease = Math.floor(Math.random() * 5) - 7; // Random decrease for cats
		description = `${petName} didn't seem to enjoy the walk very much. Cats are fairly independent creatures and prefer not to exercise.`;
	}

	userDb.energy = Math.max(
		userDb.energy - userDb.energy * (energyDecreasePercentage / 100),
		0
	);

	userDb.affection = Math.max(
		Math.min(userDb.affection + affectionIncrease, 100),
		0
	);

	userDb.happiness = Math.max(
		Math.min(userDb.happiness + happinessIncrease, 100),
		0
	);

	await userDb.save();

	const walkEmbed = new EmbedBuilder()
		.setColor("#9e38fe")
		.setTitle(`${petName} went for a walk!`)
		.setDescription(description)
		.addFields({
			name: "Energy",
			value: `${variables.getEnergy(userDb.energy)}`,
			inline: true,
		}, {
			name: "Affection",
			value: `${variables.getAffection(userDb.affection)}`,
			inline: true,
		}, {
			name: "Happiness",
			value: `${variables.getHappiness(userDb.happiness)}`,
			inline: true,
		})
		.setTimestamp();

	if (interaction.deferred || interaction.replied) {
		await interaction.followUp({
			embeds: [walkEmbed],
		});
	} else {
		await interaction.reply({
			embeds: [walkEmbed],
		});
	}
}

async function handleRun(interaction, userDb, petName, now, randomPetSound) {
	const lastWalkedArray = userDb.actionTimeStamp.lastWalked;
	const lastWalked =
		lastWalkedArray.length > 0 ?
		new Date(lastWalkedArray[lastWalkedArray.length - 1]) :
		null;
	const lastRanArray = userDb.actionTimeStamp.lastRan;
	const lastRan =
		lastRanArray.length > 0 ?
		new Date(lastRanArray[lastRanArray.length - 1]) :
		null;

	if (
		(lastWalked && now - lastWalked.getTime() < timeStamp.oneHour()) ||
		(lastRan && now - lastRan.getTime() < timeStamp.oneHour())
	) {
		const timeRemaining = Math.max(
			lastWalked ? timeStamp.oneHour() - (now - lastWalked.getTime()) : 0,
			lastRan ? timeStamp.oneHour() - (now - lastRan.getTime()) : 0
		);
		const remainingMinutes = Math.ceil(timeRemaining / (60 * 1000));
		await interaction.reply({
			content: `Please wait ${remainingMinutes} minute(s). ${petName} is still recovering from the last activity.`,
		});
		return;
	}

	userDb.actionTimeStamp.lastRan.push(new Date(now));
	if (userDb.actionTimeStamp.lastRan.length > 5) {
		userDb.actionTimeStamp.lastRan.shift();
	}

	let energyDecreasePercentage = Math.random() * 10 + 15;
	let affectionChange = 1;
	let happinessChange = 2;
	let description = `${randomPetSound}! That was intense! ${petName} is now quite tired but feeling accomplished.`;

	if (userDb.petType === 2) {
		energyDecreasePercentage *= 1.5;
		affectionChange = -1;
		happinessChange = -2;
		description = `${randomPetSound}... It seems like ${petName} didn't enjoy the run too much. Cats are fairly independent creatures and prefer not to exercise.`;
	}

	userDb.energy = Math.max(
		userDb.energy - userDb.energy * (energyDecreasePercentage / 100),
		0
	);

	userDb.affection = Math.max(
		Math.min(userDb.affection + affectionChange, 100),
		0
	);

	userDb.happiness = Math.max(
		Math.min(userDb.happiness + happinessChange, 100),
		0
	);

	await userDb.save();

	const runEmbed = new EmbedBuilder()
		.setColor("#9e38fe")
		.setTitle(`${petName} went for a run!`)
		.setDescription(description)
		.addFields({
			name: "Energy",
			value: `${variables.getEnergy(userDb.energy)}`,
			inline: true,
		}, {
			name: "Affection",
			value: `${variables.getAffection(userDb.affection)}`,
			inline: true,
		}, {
			name: "Happiness",
			value: `${variables.getHappiness(userDb.happiness)}`,
			inline: true,
		})
		.setTimestamp();

	if (interaction.deferred || interaction.replied) {
		await interaction.followUp({
			embeds: [runEmbed],
		});
	} else {
		await interaction.reply({
			embeds: [runEmbed],
		});
	}
}

async function handleHunt(interaction, userDb, petName, now, randomPetSound) {
	const huntMessages = {
		success: {
			cat: [
				`${petName} stealthily caught a small bird, proudly presenting it.`,
				`${petName} has successfully stalked and captured a cheeky mouse.`,
				`${petName} leaps and catches a butterfly, looking quite satisfied with itself.`,
				`${petName} found a lizard basking in the sun and seized the opportunity.`,
				`${petName} managed to catch a fish from the garden pond!`,
			],
			dog: [
				`${petName} playfully chased down a leaf on the wind.`,
				`${petName} dug up an old bone, wagging their tail excitedly.`,
				`${petName} managed to catch a frisbee mid-air, what a catch!`,
				`${petName} sprinted after a squirrel and triumphantly returned with a stick.`,
				`${petName} brought back a ball they found in the bushes.`,
			],
			redPanda: [
				`${petName} found some delicious berries and is munching happily.`,
				`${petName} has caught a cricket! It's a small victory.`,
				`${petName} discovered a nest of tasty eggs and is feeling proud.`,
				`${petName} snagged a juicy apple from a low hanging branch.`,
				`${petName} outwitted a frog at the pond's edge.`,
			],
		},
		failure: {
			cat: [
				`${petName} stalked a bird, but it flew away at the last second.`,
				`${petName} pounced too early and missed the mouse.`,
				`${petName} was outsmarted by a clever fish that swam away.`,
				`${petName} got distracted by a leaf and lost track of the lizard.`,
				`${petName} was too slow to catch the butterfly this time.`,
			],
			dog: [
				`${petName} chased their tail for a while but didn't catch anything else.`,
				`${petName} barked up the wrong tree, the squirrel got away.`,
				`${petName} got a little too enthusiastic and scared off the birds.`,
				`${petName} dug many holes but came back without any treasure.`,
				`${petName} was outpaced by a rabbit, better luck next time!`,
			],
			redPanda: [
				`${petName} was too slow to catch the butterfly today.`,
				`${petName} looked for bamboo but found none, looking a bit disappointed.`,
				`${petName} attempted to snatch a fish, but it slipped away.`,
				`${petName} climbed a tree in pursuit of a snack, but came back empty-handed.`,
				`${petName} got outmaneuvered by a quick-moving lizard.`,
			],
		},
	};
	const lastHuntedArray = userDb.actionTimeStamp.lastHunted;
	const lastHunted =
		lastHuntedArray.length > 0 ?
		new Date(lastHuntedArray[lastHuntedArray.length - 1]) :
		null;
	const oneHour = 3600000;

	if (lastHunted && now - lastHunted.getTime() < oneHour) {
		const timeRemaining = oneHour - (now - lastHunted.getTime());
		const remainingMinutes = Math.ceil(timeRemaining / 60000);

		await interaction.reply(
			`${petName} has already hunted recently. Please wait ${remainingMinutes} more minute(s) before hunting again.`
		);
		return;
	}

	const successRates = {
		cat: 0.7,
		dog: 0.3,
		redPanda: 0.4,
	};

	const petTypeKey =
		userDb.petType === 1 ? "dog" : userDb.petType === 2 ? "cat" : "redPanda";
	const huntSuccess = Math.random() < successRates[petTypeKey];

	const baseEnergyConsumption = 15;
	const baseExerciseGain = 5;
	const baseHappinessGain = 10;
	const baseHappinessLoss = 5;
	const baseHungerChange = userDb.petType === 2 ? 5 : 10;
	const baseThirstChange = 5;
	const baseCleanlinessDecrease = 7;
	const baseAffectionChange = 4;
	const baseSleepLevelDecrease = 15;
	const randomFactor = 0.5 + Math.random() * 0.5;

	const energyConsumption = Math.round(baseEnergyConsumption * randomFactor);
	const exerciseGain = Math.round(baseExerciseGain * randomFactor);
	const happinessChange = huntSuccess ?
		Math.round(baseHappinessGain * randomFactor) :
		-Math.round(baseHappinessLoss * randomFactor);
	let hungerChange = Math.round(baseHungerChange * randomFactor);
	hungerChange = huntSuccess ? -hungerChange : hungerChange;

	const thirstChange = Math.round(baseThirstChange * randomFactor);
	const cleanlinessDecrease = Math.round(
		baseCleanlinessDecrease * randomFactor
	);
	const affectionChange = Math.round(baseAffectionChange * randomFactor);
	const sleepLevelDecrease = Math.round(baseSleepLevelDecrease * randomFactor);

	userDb.happiness = Math.max(
		0,
		Math.min(100, userDb.happiness + happinessChange)
	);
	userDb.energy = Math.max(0, userDb.energy - energyConsumption);
	userDb.exerciseLevel = Math.min(100, userDb.exerciseLevel + exerciseGain);
	userDb.hunger = Math.max(0, Math.min(100, userDb.hunger - hungerChange));
	userDb.thirst = Math.max(0, Math.min(100, userDb.thirst - thirstChange));
	userDb.cleanliness = Math.max(0, userDb.cleanliness - cleanlinessDecrease);
	userDb.affection = Math.min(100, userDb.affection + affectionChange);
	userDb.sleepLevel = Math.max(0, userDb.sleepLevel - sleepLevelDecrease);

	userDb.huntCount += 1;
	userDb.actionTimeStamp.lastHunted.push(now);
	if (userDb.actionTimeStamp.lastHunted.length > 3) {
		userDb.actionTimeStamp.lastHunted.shift();
	}

	await userDb.save();

	const huntResultMessage = huntSuccess ?
		huntMessages.success[petTypeKey][
			Math.floor(Math.random() * huntMessages.success[petTypeKey].length)
		] :
		huntMessages.failure[petTypeKey][
			Math.floor(Math.random() * huntMessages.failure[petTypeKey].length)
		];

	const huntEmbed = new EmbedBuilder()
		.setColor("#9e38fe")
		.setTitle(`${petName} went on a hunt!`)
		.setDescription(huntResultMessage)
		.addFields({
			name: `Energy`,
			value: `${variables.getEnergy(userDb.energy)} (${
          energyConsumption > 0 ? "-" : "+"
        }${Math.abs(energyConsumption)})`,
			inline: true,
		}, {
			name: `Exercise Level`,
			value: `${variables.getExercise(userDb.exerciseLevel)} (${
          exerciseGain > 0 ? "+" : "-"
        }${Math.abs(exerciseGain)})`,
			inline: true,
		}, {
			name: `Hunger`,
			value: `${variables.getHunger(userDb.hunger)} (${
          hungerChange > 0 ? "-" : "+"
        }${Math.abs(hungerChange)})`,
			inline: true,
		}, {
			name: `Thirst`,
			value: `${variables.getThirst(userDb.thirst)} (${
          thirstChange > 0 ? "+" : "-"
        }${Math.abs(thirstChange)})`,
			inline: true,
		}, {
			name: `Cleanliness`,
			value: `${variables.getCleanliness(userDb.cleanliness)} (${
          cleanlinessDecrease > 0 ? "-" : "+"
        }${Math.abs(cleanlinessDecrease)})`,
			inline: true,
		}, {
			name: `Affection`,
			value: `${variables.getAffection(userDb.affection)} (${
          affectionChange > 0 ? "+" : "-"
        }${Math.abs(affectionChange)})`,
			inline: true,
		}, {
			name: `Sleep Level`,
			value: `${variables.getSleep(userDb.sleepLevel)} (${
          sleepLevelDecrease > 0 ? "-" : "+"
        }${Math.abs(sleepLevelDecrease)})`,
			inline: true,
		})
		.setTimestamp();

	await interaction.reply({
		embeds: [huntEmbed],
	});
}
const speechBubbles = {
  cat: ["meow", "purr", "hiss", "yowl", "chirrup"],
  dog: ["woof", "bark", "growl", "howl", "whine"],
  redPanda: ["squeak", "chirp", "click", "trill"],
  eatingSounds: ["chomp", "chew", "munch", "slurp", "gulp"],
  drinkingSounds: ["sip", "gulp", "slurp", "gurgle", "glug", "splash"],
};

function petType(petTypeId) {
  const petTypeStrMap = {
    1: "dog",
    2: "cat",
    3: "redPanda",
  };

  return petTypeStrMap[petTypeId] || null;
}

function randomSound(petTypeStr) {
  const sounds = speechBubbles[petTypeStr];
  if (!sounds) {
    console.error("Invalid pet type string:", petTypeStr);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * sounds.length);
  return sounds[randomIndex];
}

module.exports = { petType, randomSound };

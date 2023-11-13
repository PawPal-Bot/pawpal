function getCleanliness(value) {
  if (value >= 80) {
    return 'Sparkling';
  } else if (value >= 60) {
    return 'Clean';
  } else if (value >= 40) {
    return 'Tidy';
  } else if (value >= 25) {
    return 'Messy';
  } else {
    return 'Filthy';
  }
}

function getHealth(value) {
  if (value >= 90) {
    return 'Excellent';
  } else if (value >= 70) {
    return 'Good';
  } else if (value >= 50) {
    return 'Fair';
  } else if (value >= 30) {
    return 'Poor';
  } else {
    return 'Critical';
  }
}

function getHunger(value) {
  if (value >= 90) {
    return 'Full';
  } else if (value >= 70) {
    return 'Satisfied';
  } else if (value >= 50) {
    return 'Hungry';
  } else if (value >= 30) {
    return 'Starving';
  } else {
    return 'Empty';
  }
}

function getThirst(value) {
  if (value >= 90) {
    return 'Hydrated';
  } else if (value >= 70) {
    return 'Thirsty';
  } else if (value >= 50) {
    return 'Dehydrated';
  } else if (value >= 30) {
    return 'Parched';
  } else {
    return 'Dying of Thirst';
  }
}

function getEnergy(value) {
  if (value >= 80) {
    return 'Energetic';
  } else if (value >= 60) {
    return 'Active';
  } else if (value >= 40) {
    return 'Tired';
  } else if (value >= 25) {
    return 'Exhausted';
  } else {
    return 'Comatose';
  }
}

function getAffection(value) {
  if (value >= 80) {
    return 'Very Affectionate';
  } else if (value >= 60) {
    return 'Affectionate';
  } else if (value >= 40) {
    return 'Neutral';
  } else if (value >= 25) {
    return 'Distant';
  } else {
    return 'Hostile';
  }
}

function getHappiness(value) {
  if (value >= 80) {
    return 'Ecstatic';
  } else if (value >= 60) {
    return 'Happy';
  } else if (value >= 40) {
    return 'Content';
  } else if (value >= 25) {
    return 'Unhappy';
  } else {
    return 'Miserable';
  }
}

function getEducation(value) {
  if (value >= 80) {
    return 'Highly Educated';
  } else if (value >= 60) {
    return 'Well-Educated';
  } else if (value >= 40) {
    return 'Moderately Educated';
  } else if (value >= 25) {
    return 'Lowly Educated';
  } else {
    return 'Uneducated';
  }
}

function getExercise(value) {
  if (value >= 80) {
    return 'Very Active';
  } else if (value >= 60) {
    return 'Active';
  } else if (value >= 40) {
    return 'Moderately Active';
  } else if (value >= 25) {
    return 'Sedentary';
  } else {
    return 'Immobile';
  }
}

function getSleep(value) {
  if (value >= 80) {
    return 'Well-Rested';
  } else if (value >= 60) {
    return 'Resting';
  } else if (value >= 40) {
    return 'Tired';
  } else if (value >= 25) {
    return 'Exhausted';
  } else {
    return 'Comatose';
  }
}

module.exports = {
  getCleanliness: getCleanliness,
  getHealth: getHealth,
  getHunger: getHunger,
  getThirst: getThirst,
  getEnergy: getEnergy,
  getAffection: getAffection,
  getHappiness: getHappiness,
  getEducation: getEducation,
  getExercise: getExercise,
  getSleep: getSleep,
};

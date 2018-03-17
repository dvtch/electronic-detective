// Game builder for taking in setup data and number of players
// to generate a game solution state

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

function objToArray(obj) {
  // Convert the keys in the object into an array
  const keys = Object.keys(obj);
  const array = [];
  let newObj;
  keys.forEach(key => {
    newObj = obj[key];
    newObj["id"] = key;
    array.push(newObj);
  });

  return array;
};

export function buildGame(setupData, players) {
  const numPlayers = players.length;
  // First need to pick a victim, and a murderer
  const charactersArr = objToArray(setupData.characters);
  const victimIndex = getRandomInt(charactersArr.length);
  const victim = charactersArr[victimIndex].id;
  charactersArr.splice(victimIndex, 1);
  const murdererIndex = getRandomInt(charactersArr.length);
  const murderer = charactersArr[murdererIndex].id;

  // Every location gets an address
  const locationsArr = objToArray(setupData.locations);
  const addressesArr = objToArray(setupData.addresses);
  locationsArr.forEach(location => {
    const address = getRandomInt(addressesArr.length);
    location.address = addressesArr[address];
    addressesArr.splice(address, 1);
  });

  // One of the locations is the scene of the crime
  const sceneIndex = getRandomInt(locationsArr.length);
  const sceneObj = locationsArr[sceneIndex];
  const sceneId = sceneObj.id;
  locationsArr.splice(sceneIndex, 1);

  // Pick the weapon for the crime
  const weaponsArr = objToArray(setupData.weapons);
  const weapon = weaponsArr[getRandomInt(weaponsArr.length)].id;

  // Everywhere that isn't the scene of the crime has one
  // odd-numbered male, one odd-numbered female, one
  // even-numbered male, and one even-numbered female
  // with the exception of the victim being left out
  const evenMenArr = [];
  const oddMenArr = [];
  const evenWomenArr = [];
  const oddWomenArr = [];
  charactersArr.forEach(character => {
    if (character.gender === "M") {
      if (character.odd === true) {
        oddMenArr.push(character);
      } else {
        evenMenArr.push(character);
      }
    } else {
      if (character.odd === true) {
        oddWomenArr.push(character);
      } else {
        evenWomenArr.push(character);
      }
    }
  });
  const sortChars = [evenMenArr, oddMenArr, evenWomenArr, oddWomenArr];

  // Randomize the locations order before putting people
  // in each of them so as to not always have the
  // empty spot at the last location in the list
  const randLocationsArr = [];
  const numLocs = locationsArr.length;
  for (let i = 0; i < numLocs; i++) {
    const index = getRandomInt(locationsArr.length);
    // Have to replicate the location object so we don't
    // mutate the setup data
    randLocationsArr.push({...locationsArr[index]});
    locationsArr.splice(index, 1);
  }
  // Each location gets occupied
  randLocationsArr.forEach(location => {
    const occupants = [];
    sortChars.forEach(sortArr => {
      if (sortArr.length) {
        const index = getRandomInt(sortArr.length);
        occupants.push(sortArr[index].id);
        sortArr.splice(index, 1);
      }
    });
    location.occupants = occupants;
  });
  // Put the scene of the crime back into the list of locations
  randLocationsArr.push(sceneObj);
  
  // Turn our locations from an array to an object again
  const newLocationsObj = {};
  randLocationsArr.forEach(location => {
    const id = location.id;
    delete location.id;
    newLocationsObj[id] = location;
  });

  // Create the number of case sheets for the number of players
  const sheetsObj = {};
  for (let i = 0; i < numPlayers; i++) {
    const nameObj = {name: players[i]};
    const newSheet = {...setupData.sheet, ...nameObj};
    sheetsObj[i] = newSheet;
  }
  sheetsObj["numPlayers"] = numPlayers;

  // Construct the final game state object
  return {
    sheets: sheetsObj,
    locations: newLocationsObj,
    scene: sceneId,
    victim,
    murderer,
    weapon
  };
}

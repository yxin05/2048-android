window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() {
  this.MAX_SAVED_GAMES  = 5;
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";
  this.archiveInfKey    = "archiveInf";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};

// Load an old game session
LocalStorageManager.prototype.loadGameSaved = function (gameName) {
  var stateJSON = this.storage.getItem(gameName);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

// Load the saved game at index
LocalStorageManager.prototype.loadGameAtIndex = function (index) {
  var archive = this.retrieveArchiveInf();
  if (index < 0 || index > archive.games.length-1) return null;
  var stateJSON = this.storage.getItem(archive.games[index]);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

// Save current game session
LocalStorageManager.prototype.saveGameState = function (gameState, gameName) {
  this.storage.setItem(gameName, JSON.stringify(gameState));
};

// Update the meta data info for the saved games, remove old games if necessary
LocalStorageManager.prototype.updateArchiveInf = function (gameName) {
  var archive = this.retrieveArchiveInf();

  if (archive.games.length == this.MAX_SAVED_GAMES) {
    //Remove the oldest game saved from storage
    this.storage.removeItem(archive.games[0]);
    //Move the other saved games one step to the start
    for (i=0; i<archive.games.length-1; i++) {
      archive.games[i] = archive.games[i+1];
    }
    //Make room for the next game to be saved
    archive.games.pop();
  }

  archive.games.push(gameName);
  this.storage.setItem(this.archiveInfKey, JSON.stringify(archive));
}

// Get meta data info for the saved games as a JSON object
LocalStorageManager.prototype.retrieveArchiveInf = function () {
  var archive;
  var stateJSON = this.storage.getItem(this.archiveInfKey);

  if ( stateJSON ) {
    archive = JSON.parse(stateJSON);
  }
  else {
    archive = {games:[]};
  }

  return archive;
}

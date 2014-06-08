var crypto = require('crypto');

var animal = require('animal-id');

var nameToHash = {};
var hashToName = {};

function generateName() {
	var name, hash,
		attempts = 0;
	do {
		name = animal.getId();
		hash = getHash(name);
		attempts++;
	} while (attempts < 1000 && hashToName[hash]);

	nameToHash[name] = hash;
	hashToName[hash] = name;

	return {
		name: name,
		hash: hash
	};
}

function getHash(name) {
	var sum = crypto.createHash('sha1');
	sum.update(name);
	return sum.digest('hex').substr(0, 7);
}

module.exports = {
	getName: function(hash) {
		if (hash && hashToName[hash]) {
			return {
				name: hashToName[hash],
				hash: hash
			};
		}
		return generateName();
	},
	checkHash: function(hash) {
		if (hash && hashToName[hash]) {
			return hashToName[hash];
		} else {
			return false;
		}
	}
};
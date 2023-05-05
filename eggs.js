const matchers = {
	// Returns true if the seed includes all terms
	all(terms, seed) {
		for (const term of terms) {
			if (!seed.includes(term)) {
				return false;
			}
		}

		return true;
	},

	// Returns true if the seed includes any term
	any(terms, seed) {
		for (const term of terms) {
			if (seed.includes(term)) {
				return true;
			}
		}
	},

	// Returns true if the seed is an exact match to any term
	exact(terms, seed) {
		for (const term of terms) {
			if (term === seed) {
				return true;
			}
		}
	}
}

const mutations = {
	// Sets the background image of the page
	background(value) {
		document.body.style.background = value;
	},

	// Adds a style element
	css(value) {
		const element = document.createElement('style');

		element.innerText = value;

		document.head.appendChild(element);
	}
}

function findEgg(eggs) {
	const seed = urlParams.get("seed").toLowerCase();

	if (seed) {
		for (const egg of eggs) {
			if (!egg.match) continue;

			for (const key of Object.keys(egg.match)) {
				if (matchers.hasOwnProperty(key) && typeof matchers[key] === 'function') {
					if (matchers[key](egg.match[key], seed) === true) {
						handleEgg(egg);
					}
				}
			}
		}
	}
}

function handleEgg(egg) {
	if (egg.mutate) {
		for (const key of Object.keys(egg.mutate)) {
			if (mutations.hasOwnProperty(key) && typeof mutations[key] === 'function') {
				mutations[key](egg.mutate[key]);
			}
		}
	}
}

(async () => {
	const response = await fetch('./eggs.json');

	if (response.ok) {
		const eggs = await response.json();

		const egg = findEgg(eggs);

		if (egg) {
			handleEgg(egg);
		}
	}
})();

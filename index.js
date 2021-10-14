// Get the month and seed
const urlParams = new URLSearchParams(location.search);

const params = {};

if (urlParams.has("month")) {
	params.month = parseInt(urlParams.get("month"));
} else {
	const date = new Date();
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	params.month = (year - 2021) * 12 + month - 9;
}

if (urlParams.has("seed")) {
	params.seed = parseInt(urlParams.get("seed"));
} else {
	params.seed = 1;
}

// Next two functions taken from https://stackoverflow.com/a/53758827/7595722
// With some slight modification to make them look nicer
function shuffle(array, seed) {
	let m = array.length;
	let t;
	let i;

	while (m) {
		i = Math.floor(random(seed) * m--);

		t = array[m];
		array[m] = array[i];
		array[i] = t;
		++seed;
	}

	return array;
}

function random(seed) {
	var x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
}

function createBingoCell(name, link) {
	const cell = document.createElement("td");
	if (link === "") {
		cell.innerText = name;
		cell.className = "cell-unchecked";
	} else {
		cell.innerHTML = `<a href="${link}"><p>${name}</p></a>`;
		cell.className = "cell-checked";
	}
	return cell;
}

function getDateString(month) {
	const date = new Date();
	const year = Math.floor(month / 12) + 2021;
	const newMonth = (month % 12) + 9;
	date.setUTCFullYear(year, newMonth);
	return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function redirectToNewCard(month) {
	let url = window.location.href;
	url = url.slice(0, url.indexOf("?") - 1);
	url += `?month=${month}`;
	url += `&seed=${Math.floor(Math.random() * 99999)}`;
	window.location.assign(url);
}

// Fetch the data
(async () => {
	const response = await fetch(`./outages-${params.month}.json`);

	document.getElementById("loading").remove();

	if (response.status === 404) {
		// Whoops, looks like we haven't done this month's card yet
		const whoops = document.createElement("p");
		whoops.innerText =
			"Whoops, looks like we haven't made a card for this month yet, check back later";
		document.querySelector("body").appendChild(whoops);
		return;
	}

	const title = document.createElement("h2");
	title.innerText = getDateString(params.month);

	document.querySelector("body").appendChild(title);

	const data = await response.json();

	const shuffled = shuffle(data, params.seed);
	const table = document.createElement("table");

	for (let i = 0; i < 5; i++) {
		const row = document.createElement("tr");

		for (let j = 0; j < 5; j++) {
			let cell;
			if (i === 2 && j === 2) {
				// This is the free space
				cell = document.createElement("td");
				cell.innerText = "Free Space";
				cell.className = "cell-checked";
			} else {
				const cellData = shuffled.shift();
				cell = createBingoCell(cellData.name, cellData.link);
			}
			row.appendChild(cell);
		}

		table.appendChild(row);
	}

	document.querySelector("body").appendChild(table);

	const newCard = document.createElement("button");
	newCard.innerText = "Get my own card";
	newCard.onclick = () => {
		redirectToNewCard(params.month);
	};

	document.querySelector("body").appendChild(newCard);
})();

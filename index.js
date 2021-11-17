const canvas = document.getElementById("confetti")
const confetti = new JSConfetti({ canvas })

const possibleBingos = [
	[0, 1, 2, 3, 4],
	[5, 6, 7, 8, 9],
	[10, 11, 12, 13, 14],
	[15, 16, 17, 18, 19],
	[20, 21, 22, 23, 24],

	[0, 5, 10, 15, 20],
	[1, 6, 11, 16, 21],
	[2, 7, 12, 17, 22],
	[3, 8, 13, 18, 23],
	[4, 9, 14, 19, 24],

	[0, 6, 12, 18, 24],
	[20, 16, 12, 8, 4],
]

// Get the month and seed
const urlParams = new URLSearchParams(location.search)

const params = {}

if (urlParams.has("month")) {
	params.month = parseInt(urlParams.get("month"))
} else {
	const date = new Date()
	const year = date.getUTCFullYear()
	const month = date.getUTCMonth()
	params.month = (year - 2021) * 12 + month - 9
}

function stringToNumber(str) {
	// Keep the old seeds working
	let numeric = true
	for (let c of str) {
		if (c < "0" || c > "9") {
			numeric = false
			break
		}
	}
	if (numeric) {
		return parseInt(str)
	}

	// Handle alphanumerical seeds
	let result = 0
	Array.from(str).forEach((c) => {
		result = result * 0x10ffff + c.codePointAt(0)
		result = result % 0x1000000
	})
	return result
}

if (urlParams.has("seed")) {
	params.seed = stringToNumber(urlParams.get("seed"))
} else {
	params.seed = 1
}

// Next two functions taken from https://stackoverflow.com/a/53758827/7595722
// With some slight modification to make them look nicer
function shuffle(array, seed) {
	let m = array.length
	let t
	let i

	while (m) {
		i = Math.floor(random(seed) * m--)

		t = array[m]
		array[m] = array[i]
		array[i] = t
		++seed
	}

	return array
}

function random(seed) {
	var x = Math.sin(seed) * 10000
	return x - Math.floor(x)
}

function createBingoCell(name, link) {
	const cell = document.createElement("td")
	if (link === "") {
		cell.innerText = name
		cell.className = "cell-unchecked"
	} else {
		cell.innerHTML = `<a href="${link}"><p>${name}</p></a>`
		cell.className = "cell-checked"
	}
	return cell
}

function getDateString(month) {
	const date = new Date()
	const year = Math.floor(month / 12) + 2021
	const newMonth = (month % 12) + 9
	date.setUTCFullYear(year, newMonth)
	return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function redirectToNewCard(month) {
	let url = window.location.href
	if (!url.indexOf("?") !== -1) {
		url = url.slice(0, url.indexOf("?"))
	}
	url += `?month=${month}`
	url += `&seed=${Math.floor(Math.random() * 99999)}`
	window.location.assign(url)
}

// Fetch the data
;(async () => {
	const response = await fetch(`./outages-${params.month}.json`)

	document.getElementById("loading").remove()

	if (response.status === 404) {
		// Whoops, looks like we haven't done this month's card yet
		const whoops = document.createElement("p")
		whoops.innerText =
			"Whoops, looks like we haven't made a card for this month yet, check back later"
		document.querySelector("body").appendChild(whoops)
		return
	}

	const title = document.createElement("h2")
	title.innerText = getDateString(params.month)

	document.querySelector("body").appendChild(title)

	const data = await response.json()

	const shuffled = shuffle(data, params.seed)
	const table = document.createElement("table")
	// We're going to do a new array so that the final card will be in one
	// smaller array just in case we have more than 24 options, and so that
	// we can include the free space
	const finalCard = []

	for (let i = 0; i < 5; i++) {
		const row = document.createElement("tr")

		for (let j = 0; j < 5; j++) {
			let cell
			if (i === 2 && j === 2) {
				// This is the free space
				cell = document.createElement("td")
				cell.innerText = "Free Space"
				cell.className = "cell-checked"
				finalCard.push({
					name: "Free Space",
					link: "free",
				})
			} else {
				const cellData = shuffled.shift()
				finalCard.push(cellData)
				cell = createBingoCell(cellData.name, cellData.link)
			}
			row.appendChild(cell)
		}

		table.appendChild(row)
	}

	document.querySelector("body").appendChild(table)

	const newCard = document.createElement("button")
	newCard.innerText = "Get my own card"
	newCard.onclick = () => {
		redirectToNewCard(params.month)
	}

	document.querySelector("body").appendChild(newCard)

	let numBingos = 0
	possibleBingos.forEach((line) => {
		if (
			line.every((index) => {
				return finalCard[index].link !== ""
			})
		)
			numBingos++
	})

	if (numBingos > 0) {
		setTimeout(() => {
			confetti.addConfetti({
				emojis: ["⚡️", "💥", "🔥"],
				confettiNumber: 20 * numBingos,
			})
		}, 1000)
		const marquee = document.getElementById("bingo")
		marquee.classList.remove("invis")
		marquee.innerText = `${numBingos} bingo${numBingos > 1 ? "s" : ""}`
	}

	if (numBingos === possibleBingos.length) {
		// Lets add a little easter egg just in case we fill a card
		const marquee = document.getElementById("bingo")
		marquee.innerText = "🔥".repeat(500)
	}
})()

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function pickRandom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function pickMany(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

function weightedPick(entries) {
  // entries: [{ value, weight }]
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    if (roll < entry.weight) return entry.value;
    roll -= entry.weight;
  }
  return entries[entries.length - 1].value;
}

// Random date between `daysAgoMax` and `daysAgoMin` days in the past (defaults to up to 1 year ago).
function randomPastDate(daysAgoMax = 365, daysAgoMin = 0) {
  const days = randomInt(daysAgoMin, daysAgoMax);
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(randomInt(0, 23), randomInt(0, 59));
  return date;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Splits an array into chunks — used to keep insertMany batches reasonably sized.
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

module.exports = { randomInt, randomFloat, pickRandom, pickMany, weightedPick, randomPastDate, addDays, chunk };

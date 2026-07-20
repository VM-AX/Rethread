const axios = require('axios');
const { faker } = require('@faker-js/faker');
const { dicebearAvatar } = require('./imageService');

// Fetches `count` realistic people (name/email/photo) from randomuser.me in a
// SINGLE request (it supports results=N natively), instead of hammering the
// API once per user. Falls back to faker-generated people if the request
// fails or times out, so `npm run seed` still works offline.
async function fetchRealisticPeople(count, seed = 'rethread-seed') {
  try {
    const { data } = await axios.get('https://randomuser.me/api/', {
      params: { results: count, seed, nat: 'us,gb,ca,au,in' },
      timeout: 8000,
    });
    return data.results.map((r) => ({
      name: `${r.name.first} ${r.name.last}`,
      username: r.login.username,
      email: r.email,
      phone: r.phone,
      avatarUrl: r.picture.large,
      city: r.location.city,
      state: r.location.state,
      country: r.location.country,
      postalCode: String(r.location.postcode),
    }));
  } catch (err) {
    console.warn(`[randomUserService] RandomUser API unavailable (${err.message}) — falling back to faker data`);
    return Array.from({ length: count }, () => {
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const username = faker.internet.userName({ firstName: first, lastName: last }).toLowerCase();
      return {
        name: `${first} ${last}`,
        username,
        email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
        phone: faker.phone.number(),
        avatarUrl: dicebearAvatar(username),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        postalCode: faker.location.zipCode(),
      };
    });
  }
}

module.exports = { fetchRealisticPeople };

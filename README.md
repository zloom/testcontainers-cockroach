[![npm version](https://img.shields.io/npm/v/testcontainers-cockroach?color=blue)](https://www.npmjs.com/package/testcontainers-cockroach)
[![gitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/zloom/testcontainers-cockroach/blob/main/LICENSE)
# Cockroach testcontainer module
Implementation of [testcontainers-node](https://github.com/testcontainers/testcontainers-node) for cockroach database.
## Limitations
This implementation uses single node insecure instance of cockroach, in this mode you cannot set password for db. With persistent database storage cockroach required volume attached, so cockroach warns at start about data folder. There is memory storage type can be configured `.withMemoryStorage()`, additionaly you can tune db at start for better performance as descripted [here](https://www.cockroachlabs.com/docs/v24.2/local-testing.html)
## Usage
```typescript
const container = await new CockroachContainer();
container.withDatabase('testsdb');

const startedContainer = await container.start();
const connectionString = startedContainer.getConnectionUri();

const client = new Client(connectionString);
client.connect();

await client.query('CREATE TABLE accounts (id UUID PRIMARY KEY, balance INT8)');
await client.query(`INSERT INTO accounts (id, balance) VALUES ($1, 1000), ($2, 250), ($3, 0)`, [v4(), v4(), v4()]);
const accountsResult = await client.query('SELECT id, balance FROM accounts ORDER BY balance')
```
## License
This project is licensed under the MIT License

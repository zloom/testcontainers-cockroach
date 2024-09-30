import { v4 } from 'uuid'
import { CockroachContainer } from './index'
import { Client } from 'pg'

test('Cockroach container can start witn memory storage', async () => {
  const container = await new CockroachContainer();
  container.withMemoryStorage();

  const startedContainer = await container.start();
  const connectionString = startedContainer.getConnectionUri();

  const client = new Client(connectionString);
  client.connect();

  await client.query('CREATE TABLE accounts (id UUID PRIMARY KEY, balance INT8)');
  await client.query(`INSERT INTO accounts (id, balance) VALUES ($1, 1000), ($2, 250), ($3, 0)`, [v4(), v4(), v4()]);
  const accountsResult = await client.query('SELECT id, balance FROM accounts ORDER BY balance')

  expect(accountsResult.rows).toMatchObject([{ balance: '0' }, { balance: '250' }, { balance: '1000' }])

  await client.end();
  await startedContainer.stop();
})

test('Cockroach container can start with custom db name', async () => {
  const container = await new CockroachContainer();
  container.withDatabase('testsdb');

  const startedContainer = await container.start();
  const connectionString = startedContainer.getConnectionUri();

  const client = new Client(connectionString);
  client.connect();

  await client.query('CREATE TABLE accounts (id UUID PRIMARY KEY, balance INT8)');
  await client.query(`INSERT INTO accounts (id, balance) VALUES ($1, 1000), ($2, 250), ($3, 0)`, [v4(), v4(), v4()]);
  const accountsResult = await client.query('SELECT id, balance FROM accounts ORDER BY balance')
  
  expect(accountsResult.rows).toMatchObject([{ balance: '0' }, { balance: '250' }, { balance: '1000' }])

  await client.end();
  await startedContainer.stop();
})
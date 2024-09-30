import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers'

const COCKROACH_PORT = 26257
const COCKROACH_REST_PORT = 8080
const COCKROACH_USERNAME = 'root'

export class CockroachContainer extends GenericContainer {
  private database = "defaultdb";
  private storageType = "cockroach-data";

  constructor(image = 'cockroachdb/cockroach:v23.1.4') {
    super(image)
    this
      .withExposedPorts(COCKROACH_PORT, COCKROACH_REST_PORT)
      .withWaitStrategy(
        Wait.forHttp('/health?ready=1', COCKROACH_REST_PORT)
          .forStatusCode(200)
          .withStartupTimeout(120_000),
      )
  }

  public withDatabase(database: string): this {
    this.database = database;
    return this;
  }

  public withMemoryStorage(): this {
    this.storageType = 'type=mem,size=0.25'
    return this;
  }

  public override async start(): Promise<StartedCockroachContainer> {
    this.withEnvironment({
      COCKROACH_DATABASE: this.database,
    });

    this.withCommand([
      'start-single-node',
      '--insecure',
      `--store=${this.storageType}`,
    ])

    return new StartedCockroachContainer(await super.start(), this.database)
  }
}

export class StartedCockroachContainer extends AbstractStartedContainer {
  private readonly port: number;

  constructor(startedTestContainer: StartedTestContainer,
    private readonly database: string,
  ) {
    super(startedTestContainer)
    this.port = startedTestContainer.getMappedPort(COCKROACH_PORT)
  }

  public getPort(): number {
    return this.port;
  }

  public getDatabase(): string {
    return this.database;
  }

  /**
  * @returns A connection URI in the form of `postgres[ql]://[username[:password]@][host[:port],]/database`
  */
  public getConnectionUri(): string {
    const url = new URL("", "postgres://");
    url.hostname = this.getHost();
    url.port = this.getPort().toString();
    url.pathname = this.getDatabase();
    url.username = COCKROACH_USERNAME;
    return url.toString();
  }
}

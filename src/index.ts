import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers'

const DB_PORT = 26257
const REST_PORT = 8080

export class StartedCockroachContainer extends AbstractStartedContainer {
  private readonly port: string

  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer)
    this.port = startedTestContainer.getMappedPort(DB_PORT).toString()
  }

  public getPort(): string {
    return this.port
  }
}

export class CockroachContainer extends GenericContainer {
  constructor(image = 'cockroachdb/cockroach:v23.1.4') {
    super(image)
    this.withExposedPorts(DB_PORT, REST_PORT)
      .withWaitStrategy(
        Wait.forHttp('/health?ready=1', REST_PORT)
          .forStatusCode(200)
          .withStartupTimeout(120_000),
      )
      .withCommand([
        'start-single-node',
        '--insecure',
        '--store=type=mem,size=0.25',
      ])
      .withReuse()
  }

  public override async start(): Promise<StartedCockroachContainer> {
    const started = await super.start()
    return new StartedCockroachContainer(started)
  }
}

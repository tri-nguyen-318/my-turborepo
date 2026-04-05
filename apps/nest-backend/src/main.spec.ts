import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

jest.mock('nest-winston', () => ({
  WinstonModule: { createLogger: jest.fn().mockReturnValue({ log: jest.fn() }) },
}));

jest.mock('./app.module', () => ({ AppModule: class AppModule {} }));
jest.mock('./shared/logger/winston.config', () => ({ winstonConfig: {} }));
jest.mock('morgan', () =>
  jest.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
);
jest.mock('cookie-parser', () =>
  jest.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
);

describe('bootstrap', () => {
  let mockApp: {
    useGlobalPipes: jest.Mock;
    use: jest.Mock;
    enableCors: jest.Mock;
    listen: jest.Mock;
  };

  beforeEach(() => {
    mockApp = {
      useGlobalPipes: jest.fn(),
      use: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    delete process.env.FRONTEND_URL;
  });

  afterEach(() => jest.clearAllMocks());

  it('creates the app with AppModule and the winston logger', async () => {
    await bootstrap();

    expect(WinstonModule.createLogger).toHaveBeenCalledWith({});
    expect(NestFactory.create).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ logger: expect.objectContaining({ log: expect.any(Function) }) }),
    );
  });

  it('registers a ValidationPipe with whitelist and transform enabled', async () => {
    await bootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledTimes(1);
    const pipe = mockApp.useGlobalPipes.mock.calls[0][0];
    expect(pipe).toBeInstanceOf(ValidationPipe);
  });

  it('registers morgan and cookie-parser middleware', async () => {
    await bootstrap();

    expect(mockApp.use).toHaveBeenCalledTimes(2);
  });

  it('enables CORS with credentials and origins derived from FRONTEND_URL', async () => {
    process.env.FRONTEND_URL = 'https://example.com';
    await bootstrap();

    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        credentials: true,
        origin: expect.arrayContaining(['https://example.com', 'https://www.example.com']),
      }),
    );
  });

  it('strips trailing slash from FRONTEND_URL when building origins', async () => {
    process.env.FRONTEND_URL = 'https://example.com/';
    await bootstrap();

    const { origin } = (mockApp.enableCors as jest.Mock).mock.calls[0][0];
    expect(origin).not.toContain('https://example.com/');
    expect(origin).toContain('https://example.com');
  });

  it('listens on port 3001', async () => {
    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(3001);
  });
});

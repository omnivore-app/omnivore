import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app/app.module'
import { EnvVariables } from './config/env-variables'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const port = configService.get<number>(EnvVariables.NEST_PORT)

  app.setGlobalPrefix('api/v2')

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Omnivore API v2')
    .setDescription('The Omnivore read-it-later application API')
    .setVersion('2.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description:
        'Enter JWT token obtained from the login mutation. Example: Bearer <token>',
      in: 'header',
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('health', 'Health check endpoints')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/v2/swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  // Configure CORS for frontend with credentials support
  const frontendUrl = configService.get<string>(EnvVariables.FRONTEND_URL)
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-omnivoreclient', // Legacy web custom header for client identification
    ],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Allow non-whitelisted properties (for GraphQL flexibility)
      skipUndefinedProperties: false, // Validate undefined properties
      skipNullProperties: true, // Skip validation for null properties (fixes GraphQL null handling)
      transformOptions: {
        enableImplicitConversion: true, // Convert primitive types automatically
      },
    }),
  )

  await app.listen(port, () => {
    Logger.log(`App is listening on port ${port}`)
  })
}

bootstrap()

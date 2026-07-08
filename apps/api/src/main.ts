import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ─── Security ──────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ─── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // ─── Global Prefix ─────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Global Pipes ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters & Interceptors ─────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── Swagger Docs ──────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('MyClass LMS API')
      .setDescription('Production-grade Learning Management System REST API')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .addTag('Auth', 'Authentication & session management')
      .addTag('Users', 'User management (Admin)')
      .addTag('Students', 'Student profile management')
      .addTag('Teachers', 'Teacher profile management')
      .addTag('Standards', 'Grade/class management')
      .addTag('Subjects', 'Subject management')
      .addTag('Chapters', 'Chapter management')
      .addTag('Lessons', 'Lesson management')
      .addTag('Videos', 'Video content management')
      .addTag('Video Progress', 'Watch tracking & heartbeat')
      .addTag('Assignments', 'Assignment lifecycle')
      .addTag('Submissions', 'Student submissions & evaluation')
      .addTag('Notifications', 'In-app notification system')
      .addTag('Analytics', 'Dashboard analytics & reports')
      .addTag('Uploads', 'Cloudinary file upload')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }

  // ─── Health Check ──────────────────────────────────────────────
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(port);
  console.log(`🚀 MyClass LMS API running on http://localhost:${port}/api`);
}

bootstrap();

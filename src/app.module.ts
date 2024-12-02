import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PostController } from './post/post.controller';
import { JwtService } from '@nestjs/jwt';
import { PostService } from './post/post.service';
import { ConfigModule } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';
import { CommentsService } from './comments/comments.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PostModule,
    PrismaModule,
    AuthModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    PostService,
    JwtService,
    CommentsService,
  ],
})
export class AppModule {}

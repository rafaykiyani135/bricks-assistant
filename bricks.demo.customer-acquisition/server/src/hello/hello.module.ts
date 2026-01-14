import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hello } from './hello.model';
import { HelloResolver } from './hello.resolver';
import { HelloService } from './hello.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hello])],
  providers: [HelloResolver, HelloService],
})
export class HelloModule {}

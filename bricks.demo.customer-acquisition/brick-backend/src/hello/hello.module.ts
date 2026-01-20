import { Module } from '@nestjs/common';
import { HelloResolver } from './hello.resolver';
import { HelloService } from './hello.service';
import { Hello } from './hello.model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Hello])],
  providers: [HelloResolver, HelloService],
})
export class HelloModule {}

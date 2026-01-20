import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmployeeModule, 
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UsersModule {}

import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guard/gql-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from './user.service';
import { UserType } from './user.type';
import { CreateUserInput } from './dto/create-user-input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  //@UseGuards(GqlAuthGuard, RolesGuard)
  //@Roles('ADMIN','MANAGER')
  @Mutation(() => UserType)
  async createUser(@Args('input') input: CreateUserInput) {
    console.log('Resolver received input:', input);
    return this.userService.create(input);
  }
}

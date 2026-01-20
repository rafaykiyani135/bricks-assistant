// auth.resolver.ts
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/auth-response.type';
import { Public } from './decorators/public.decorator';
import { GqlAuthGuard } from './guard/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserService } from '../users/user.service';
import { UserType } from '../users/user.type';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await this.authService.validateUser(email, password);
    const { access_token } = this.authService.login(user);

    return {
      token: access_token,
      employee: user.employee,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserType)
  async me(@CurrentUser() user: any) {
    return await this.userService.findById(user.sub);
  }
}

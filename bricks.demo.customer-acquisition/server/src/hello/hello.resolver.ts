import { Args, Query, Resolver } from '@nestjs/graphql';
import { Hello, HelloQuery } from './hello.model';
import { HelloService } from './hello.service';

@Resolver(() => Hello)
export class HelloResolver {
  constructor(private readonly helloService: HelloService) {}
  @Query(() => Hello)
  async getHello(@Args() args: HelloQuery) {
    return this.helloService.getHello(args.message);
  }
}

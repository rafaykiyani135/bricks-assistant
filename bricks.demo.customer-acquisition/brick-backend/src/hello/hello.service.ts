import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Hello } from './hello.model';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HelloService {
  constructor(@InjectRepository(Hello) private repo: Repository<Hello>) {}

  async getHello(name: string) {
    const result = await this.repo.findOneBy({ message: name });
    return result || new Hello(name);
  }
}

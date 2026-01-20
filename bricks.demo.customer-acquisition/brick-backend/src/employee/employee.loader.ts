
import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { Employee } from "./employee.entity";
import { EmployeeService } from "./employee.service";
import { In } from "typeorm";

@Injectable()
export class EmployeeLoader {
  constructor(private employeesService: EmployeeService) {}
  public readonly loader = new DataLoader<number, Employee>(async (ids: number[]) => {
    console.log('EMPLOYEE LOADER BATCH => ', ids);
    const employees = await this.employeesService.findBy(ids);
    const map = new Map(employees.map(e => [e.id, e]));
    return ids.map(id =>
      map.get(id) ?? new Error(`Employee with id ${id} not found`)
    );
  });
}

import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { ProjectEntity } from "./project.entity";
import { ProjectService } from "./project.service";
import { In } from "typeorm";

@Injectable()
export class ProjectLoader {
  constructor(private projectService: ProjectService) {}

  public readonly loader = new DataLoader<number, ProjectEntity>(async (ids: number[]) => {
    console.log('PROJECT LOADER BATCH => ', ids);
    const projects = await this.projectService.findByIds(ids); 
    const map = new Map(projects.map(p => [p.id, p]));

    return ids.map(id =>
      map.get(id) ?? new Error(`Project with id ${id} not found`)
    );
  });
}

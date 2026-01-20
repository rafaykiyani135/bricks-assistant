import { registerEnumType } from "@nestjs/graphql";

export enum JobCategory {
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  CARPENTRY = 'CARPENTRY',
  PAINTING = 'PAINTING',
  OTHER = 'OTHER',
}


registerEnumType(JobCategory, {
  name: 'JobCategory', 
  description: 'Categoría de un trabajo',
});
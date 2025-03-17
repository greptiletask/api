export interface Schedule {
  projectSlug: string;
  type: string;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

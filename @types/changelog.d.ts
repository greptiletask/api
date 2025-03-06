export interface Changelog {
  userId: string;
  changelog: string;
  version: string;
  repo: string;
  createdAt: Date;
  updatedAt: Date;
  projectSlug: string;
}

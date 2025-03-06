export interface Changelog {
  userId: string;
  changelog: string;
  title: string;
  version: string;
  repo: string;
  createdAt: Date;
  updatedAt: Date;
  projectSlug: string;
}

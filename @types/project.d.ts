export interface Project {
  id: string;
  repoFullName: string;
  createdAt: Date;
  updatedAt: Date;
  customDomain: string;
  isDomainVerified: boolean;
}

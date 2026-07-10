export type TeamCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeamMemberRecord = {
  id: string;
  name: string;
  roleId: string | null;
  roleName: string | null;
  roleDisplayOrder: number | null;
  roleIsActive: boolean | null;
  departmentId: string | null;
  departmentName: string | null;
  departmentDisplayOrder: number | null;
  departmentIsActive: boolean | null;
  academicYear: number | null;
  designation: string | null;
  email: string | null;
  linkedin: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  cloudinaryPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamCatalogResponse = {
  data: TeamCatalogItem[];
};

export type TeamMemberResponse = {
  data: TeamMemberRecord[];
};

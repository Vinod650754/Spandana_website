import type { TeamMemberRecord } from "@/types/team";

export type TeamDepartmentGroup = {
  id: string;
  name: string;
  displayOrder: number;
  members: TeamMemberRecord[];
};

export type TeamRoleGroup = {
  id: string;
  name: string;
  displayOrder: number;
  departments: TeamDepartmentGroup[];
};

export function groupTeamMembersByRole(members: TeamMemberRecord[]) {
  const roleGroups: TeamRoleGroup[] = [];

  for (const member of members) {
    const roleId = member.roleId ?? member.roleName ?? member.id;
    const roleName = member.roleName ?? "Unassigned Role";
    const roleDisplayOrder = member.roleDisplayOrder ?? 0;
    const departmentId = member.departmentId ?? member.departmentName ?? member.id;
    const departmentName = member.departmentName ?? "Unassigned Department";
    const departmentDisplayOrder = member.departmentDisplayOrder ?? 0;

    let roleGroup = roleGroups.find((group) => group.id === roleId);
    if (!roleGroup) {
      roleGroup = { id: roleId, name: roleName, displayOrder: roleDisplayOrder, departments: [] };
      roleGroups.push(roleGroup);
    }

    let departmentGroup = roleGroup.departments.find((group) => group.id === departmentId);
    if (!departmentGroup) {
      departmentGroup = { id: departmentId, name: departmentName, displayOrder: departmentDisplayOrder, members: [] };
      roleGroup.departments.push(departmentGroup);
    }

    departmentGroup.members.push(member);
  }

  return roleGroups
    .map((roleGroup) => ({
      ...roleGroup,
      departments: roleGroup.departments
        .map((departmentGroup) => ({
          ...departmentGroup,
          members: [...departmentGroup.members].sort((left, right) => {
            if (left.displayOrder !== right.displayOrder) {
              return left.displayOrder - right.displayOrder;
            }

            return left.name.localeCompare(right.name);
          }),
        }))
        .sort((left, right) => {
          if (left.displayOrder !== right.displayOrder) {
            return left.displayOrder - right.displayOrder;
          }

          return left.name.localeCompare(right.name);
        }),
    }))
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }

      return left.name.localeCompare(right.name);
    });
}

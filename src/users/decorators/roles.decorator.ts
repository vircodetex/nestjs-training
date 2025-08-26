import { SetMetadata } from "@nestjs/common";
import { Role } from "../role.enum";

export const ROLES_KEY = "roles";

// ... to accept:
//  @Roles(Role.ADMIN, Role.USER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
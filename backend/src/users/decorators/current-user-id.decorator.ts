import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// This decorator is a bit different from the other decorators where
// we put only meta data
export const CurrentUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.sub;
    }
)
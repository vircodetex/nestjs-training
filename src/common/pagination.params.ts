import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationParams {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    @Max(10000)
    limit: number = 10

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    offset: number = 0
}

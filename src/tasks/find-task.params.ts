import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { TaskStatus } from "./task.model";
import { Transform } from "class-transformer";
import { string } from "joi";

export class FindTaskParams {
    @IsNotEmpty()
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsOptional()
    @MinLength(3)
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(
        ({ value }: { value?: string }) => {
            if (!value) {
                return undefined;
            }
            return value.split(',').map(label => label.trim()).filter(label => label.length > 0);
        }
    )
    labels?: string[];

    @IsOptional()
    @IsIn(['createdAt', 'updatedAt', 'title', 'status'])
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
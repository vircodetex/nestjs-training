import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { TaskStatus } from "./task.model";
import { CreateTaskLabelDto } from "./create-task-label.dto";
import { Type } from "class-transformer";

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(TaskStatus)
    status: TaskStatus;

    // Was used for manual testing only
    // @IsNotEmpty()
    // @IsUUID()
    // userId: string;

    userId: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTaskLabelDto)
    labels?: CreateTaskLabelDto[];
}

// import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
// import { TaskStatus } from "./task.model";
import { CreateTaskDto } from "./create-task.dto";
import { PartialType } from "@nestjs/mapped-types";

// export class UpdateTaskDto {
//     @IsNotEmpty()
//     @IsString()
//     @IsOptional()
//     title?: string;

//     @IsNotEmpty()
//     @IsString()
//     @IsOptional()
//     description?: string;

//     @IsNotEmpty()
//     @IsEnum(TaskStatus)
//     @IsOptional()
//     status?: TaskStatus;
// }

export class UpdateTaskDto extends PartialType(CreateTaskDto) { }

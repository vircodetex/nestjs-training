import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParams } from './find-one.params';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './task.entity';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { FindTaskParams } from './find-task.params';
import { PaginationParams } from '../common/pagination.params';
import { PaginationResponse } from '../common/pagination.response';
import type { AuthRequest } from '../users/auth.request';
import { CurrentUserId } from '../users/decorators/current-user-id.decorator';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    // public async findAll(): Promise<Task[]> {
    //     // no need to await here as the logic is inside the service
    //     return this.tasksService.findAll();
    // }
    public async findAll(
        @Query() filters: FindTaskParams,
        @Query() pagination: PaginationParams,
        @CurrentUserId() userId: string
    ): Promise<PaginationResponse<Task>> {
        const [items, total] = await this.tasksService.findAll(filters, pagination, userId);
        return {
            data: items,
            meta: {
                total,
                ...pagination
                //offset: pagination.offset,
                //limit: pagination.limit,
            },
        };
    }

    @Get(':id')
    public async findOne(
        @Param() params: FindOneParams,
        @CurrentUserId() userId: string
    ): Promise<Task> {
        return this.findOneOrFail(params.id, userId);
    }

    // @Post()
    // public async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    //     return this.tasksService.createTask(createTaskDto);
    // }

    //With user id from the authentication
    // @Post()
    // public async create(
    //     @Body() createTaskDto: CreateTaskDto,
    //     @Request() request: AuthRequest
    // ): Promise<Task> {
    //     return this.tasksService.createTask({
    //         ...createTaskDto, userId: request.user.sub
    //     });
    // }

    //With user id from the authentication through decorator
    @Post()
    public async create(
        @Body() createTaskDto: CreateTaskDto,
        @CurrentUserId() userId: string
    ): Promise<Task> {
        return this.tasksService.createTask({
            ...createTaskDto, userId
        });
    }


    // @Patch(':id/status')
    // public updateTaskStatus(
    //     @Param() params: FindOneParams,
    //     @Body() body: UpdateTaskStatusDto
    // ): ITask {
    //     const task = this.findOneOrFail(params.id);
    //     task.status = body.status;
    //     return task;
    // }

    @Patch(':id')
    public async updateTask(
        @Param() params: FindOneParams,
        @Body() updateTaskDto: UpdateTaskDto,
        @CurrentUserId() userId: string
    ): Promise<Task> {
        const task = await this.findOneOrFail(params.id, userId);
        try {
            return this.tasksService.updateTask(task, updateTaskDto);
        } catch (error) {
            if (error instanceof WrongTaskStatusException) {
                throw new BadRequestException([error.message]);
            }
            throw error;
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteTask(
        @Param() params: FindOneParams,
        @CurrentUserId() userId: string
    ): Promise<void> {
        const task = await this.findOneOrFail(params.id, userId);
        this.tasksService.deleteTask(task);
    }

    // Labels
    // 1) Create an endpoint POST :id/labels
    // 2) addLabels to add more labels to existing (or not) labels
    // 3) to avoid error 500 we need to make sure the label is unique
    @Post(':id/labels')
    public async addLabels(
        @Param() params: FindOneParams,
        @Body() labels: CreateTaskLabelDto[],
        @CurrentUserId() userId: string
    ): Promise<Task> {
        const task = await this.findOneOrFail(params.id, userId);
        return this.tasksService.addLabels(task, labels);
    }


    @Delete(':id/labels')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async removeLabels(
        @Param() params: FindOneParams,
        @Body() labelNames: string[],
        @CurrentUserId() userId: string
    ): Promise<void> {
        const task = await this.findOneOrFail(params.id, userId);

        this.tasksService.removeLabels(task, labelNames);
    }

    private async findOneOrFail(id: string, userId: string): Promise<Task> {
        const task = await this.tasksService.findOne(id);
        if (!task) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }
        this.checkTaskOwnership(task, userId);
        return task;
    }

    private checkTaskOwnership(task: Task, userId: string): void {
        if (task.userId !== userId) {
            throw new ForbiddenException('You can only access your own task');
        }
    }


}

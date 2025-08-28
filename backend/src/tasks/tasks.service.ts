
import { Injectable } from '@nestjs/common';

import { TaskStatus } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './task.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskLabel } from './task-label.entity';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { FindTaskParams } from './find-task.params';
import { PaginationParams } from '../common/pagination.params';
import { filter } from 'rxjs';


@Injectable()
export class TasksService {
    // in-memory temporary storage
    //private tasks: ITask[] = [];

    // constructor(
    //     @InjectRepository(Task)
    //     private readonly repository: Repository<Task>
    // ) { }

    // findAll(): ITask[] {
    //     return this.tasks;
    // }

    // findOne(id: string): ITask | undefined {
    //     return this.tasks.find(task => task.id === id);
    // }

    // create(createTaskDto: CreateTaskDto): ITask {
    //     const newTask: ITask = {
    //         id: randomUUID(),
    //         ...createTaskDto
    //     };
    //     this.tasks.push(newTask);
    //     return newTask;
    // }

    // updateTask(task: ITask, updateTaskDto: UpdateTaskDto): ITask {
    //     if (updateTaskDto.status && !this.isValidStatusTransition(task.status, updateTaskDto.status)) {
    //         throw new WrongTaskStatusException();
    //     }
    //     Object.assign(task, updateTaskDto);
    //     return task;
    // }

    // private isValidStatusTransition(curStatus: TaskStatus, newStatus: TaskStatus): boolean {
    //     const statusInOrder = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    //     return statusInOrder.indexOf(curStatus) <= statusInOrder.indexOf(newStatus);
    // }

    // delete(task: ITask): void {
    //     this.tasks = this.tasks.filter(t => t.id !== task.id);
    // }

    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,

        @InjectRepository(TaskLabel)
        private readonly labelsRepository: Repository<TaskLabel>
    ) { }

    // async findAll(): Promise<Task[]> {
    //     return await this.tasksRepository.find();
    // }
    // async findAll(filters: FindTaskParams): Promise<Task[]> {
    //     return await this.tasksRepository.find({
    //         where: {
    //             status: filters.status,
    //         },
    //         relations: ['labels'],
    //     });
    // }
    async findAll(
        filters: FindTaskParams,
        pagination: PaginationParams,
        userId: string
    ): Promise<[Task[], number]> {
        // const where: FindOptionsWhere<Task> = {};
        // if (filters.status) {
        //     where.status = filters.status;
        // }
        // if (filters.search?.trim()) {
        //     // Here it's a AND
        //     where.title = Like(`%${filters.search}%`);
        //     where.description = Like(`%${filters.search}%`);
        // }
        // return await this.tasksRepository.findAndCount({
        //     where,
        //     relations: ['labels'],
        //     skip: pagination.offset,
        //     take: pagination.limit,
        // });

        // With QueryBuilder

        const query = this.tasksRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.labels', 'label')
            .where('task.userId = :userId', { userId });
        if (filters.status) {
            query.andWhere('task.status = :status', { status: filters.status });
        }
        if (filters.search?.trim()) {
            query.andWhere(
                '(task.title ILIKE :search OR task.description ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
        // if (filters.labels?.length) {
        //     query.andWhere('label.name IN (:...labels)', { labels: filters.labels });
        // }
        if (filters.labels?.length) {
            const subquery = query.subQuery()
                .select('labels.taskId')
                .from('task_label', 'labels')
                .where('labels.name IN (:...names)', { names: filters.labels })
                .getQuery();

            query.andWhere(`task.id IN ${subquery}`);
        }

        query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);

        query.skip(pagination.offset).take(pagination.limit);

        //debug
        //console.log(query.getQuery());

        return await query.getManyAndCount();
    }

    async findOne(id: string): Promise<Task | null> {
        return await this.tasksRepository.findOne({
            where: { id },
            relations: ['labels'] // usually commented, as the children are not loaded for better performances
        });
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        if (createTaskDto.labels) {
            createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
        }
        //create the Task object and save it
        // TypeOrm do that implicitly for us:
        //await this.repository.create({title: createTaskDto.title, description: createTaskDto.description, status: createTaskDto.status, userId: createTaskDto.userId});
        return await this.tasksRepository.save(createTaskDto);
    }

    async updateTask(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
        if (updateTaskDto.status && !this.isValidStatusTransition(task.status, updateTaskDto.status)) {
            throw new WrongTaskStatusException();
        }
        if (updateTaskDto.labels) {
            updateTaskDto.labels = this.getUniqueLabels(updateTaskDto.labels);
        }
        Object.assign(task, updateTaskDto);
        return await this.tasksRepository.save(task);
    }

    async addLabels(task: Task, labelDtos: CreateTaskLabelDto[]): Promise<Task> {
        const existingNames = new Set(task.labels.map(label => label.name));
        const newLabels =
            this.getUniqueLabels(labelDtos)
                .filter(label => !existingNames.has(label.name))
                .map(label => this.labelsRepository.create(label));
        // Make sure to keep the previous labels because of cascading
        // they would be erased otherwise
        if (newLabels.length > 0) {
            task.labels = [...task.labels, ...newLabels];
            return await this.tasksRepository.save(task);
        }
        return task;
    }

    async removeLabels(task: Task, labelsToRemove: string[]): Promise<Task> {
        if (labelsToRemove.length > 0) {
            task.labels = task.labels.filter(label => !labelsToRemove.some(l => l === label.name));
            return await this.tasksRepository.save(task);
        }
        return task;
    }

    async deleteTask(task: Task): Promise<void> {
        // rather use remove that delete
        //await this.tasksRepository.delete(task);
        // or us delete with task.id
        //await this.tasksRepository.delete(task.id);
        await this.tasksRepository.remove(task);
    }



    private isValidStatusTransition(curStatus: TaskStatus, newStatus: TaskStatus): boolean {
        const statusInOrder = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
        return statusInOrder.indexOf(curStatus) <= statusInOrder.indexOf(newStatus);
    }

    private getUniqueLabels(labels: CreateTaskLabelDto[]): CreateTaskLabelDto[] {
        const uniqueNames = [...new Set(labels.map(label => label.name))];
        return uniqueNames.map(name => ({ name }));
    }
}

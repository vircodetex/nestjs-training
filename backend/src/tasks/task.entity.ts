import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskStatus } from "./task.model";
import { User } from "../users/user.entity";
import { TaskLabel } from "./task-label.entity";

// one-to-many
// User that has many Tasks
// 1) User - user - id
// 2) Task - task -userId
@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: false,
    })
    title: string;

    @Column({
        type: "text",
        nullable: false,
    })
    description: string;

    @Column({
        type: "enum",
        enum: TaskStatus,
        default: TaskStatus.OPEN
    })
    status: TaskStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.tasks, { nullable: false })
    user: User;

    // cascade here means if a Label has been created then a task has been created, saving the task will also save its labels
    @OneToMany(() => TaskLabel, label => label.task, { cascade: true })
    labels: TaskLabel[];
}
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Task } from "./task.entity";

@Entity()
@Unique(["name", "taskId"])
export class TaskLabel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: false,
    })
    name: string;

    @Column()
    @Index()
    taskId: string;

    // onDelete: 'CASCADE' means that if the task is deleted, all its labels will be deleted as well
    // orphanedRowAction means if a task is deleted, its labels would be nullify (or deleted?), then deleted by the database with onDelete: 'CASCADE'
    @ManyToOne(() => Task, task => task.labels, { nullable: false, onDelete: 'CASCADE', orphanedRowAction: 'delete' })
    task: Task;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
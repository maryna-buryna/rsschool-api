import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
    @PrimaryGeneratedColumn() id: number;

    @CreateDateColumn()
    createdDate: number;

    @UpdateDateColumn()
    updatedDate: number;

    @Column()
    name: string;

    @Column()
    year: number;

    @Column()
    primarySkillId: string;

    @Column()
    primarySkillName: string;
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_log')
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    entity: string; // Name of the entity changed

    @Column()
    entityId: string; // ID of the entity changed

    @Column()
    action: 'CREATE' | 'UPDATE' | 'DELETE'; // Action performed

    @Column({ nullable: true })
    authId: string;

    @Column({ type: 'jsonb', nullable: true })
    payload: any; // user token or any other payload

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

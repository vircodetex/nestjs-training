import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

//console.log('DDDDDDDDDD Migration ENV:', JSON.stringify(process.env, null, 2));


export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    //look in the dist folder of transpile all the entities we have
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/src/migrations/*{.ts,.js}'],
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,

})
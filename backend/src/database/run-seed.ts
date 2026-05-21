import { DataSource } from 'typeorm';
import { seedFishSpecies } from './fish-species.seed';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'yediao',
  password: process.env.DB_PASSWORD || 'yediao123',
  database: process.env.DB_NAME || 'yediao',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});

dataSource
  .initialize()
  .then(async () => {
    console.log('DataSource initialized');
    await seedFishSpecies(dataSource);
    console.log('Seed completed successfully');
    await dataSource.destroy();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during seed:', err);
    process.exit(1);
  });
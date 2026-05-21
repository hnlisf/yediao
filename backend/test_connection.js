const { DataSource } = require('typeorm');
const path = require('path');

const ds = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'yediao',
  password: 'yediao123',
  database: 'yediao',
  entities: [path.join(__dirname, 'src/spots/spot.entity.ts')],
  synchronize: false,
  logging: true
});

ds.initialize().then(() => {
  console.log('SUCCESS: Connected');
  return ds.getRepository('Spot').find({ relations: ['creator'] });
}).then(spots => {
  console.log('Spots found:', spots.length);
  console.log(JSON.stringify(spots, null, 2));
  ds.destroy();
}).catch(e => {
  console.error('ERROR:', e.message);
  ds.destroy();
});

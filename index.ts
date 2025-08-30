import express from 'express';
import packagesRoutes from './routes/package.routes';
import {sequelizeConnection} from './db/config';
import {seedDb} from './db/seed';

const port = 3000;
export const app = express();

app.listen(port, () => {
	console.log(`Hemnet application running on port ${port}!`);
});
app.use(express.json());

//  Initialize database //
sequelizeConnection.sync({force: true}).then(async () => {
	console.log('DB running');

	await seedDb();
});

app.use('/api/packages', packagesRoutes);

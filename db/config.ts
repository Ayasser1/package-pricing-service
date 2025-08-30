import {Sequelize} from 'sequelize';

const sequelizeConnection = new Sequelize({
	dialect: 'sqlite',
	storage: './db/sqlite.db',
});

export {sequelizeConnection};

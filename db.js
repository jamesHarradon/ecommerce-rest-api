const Pool = require('pg').Pool;
require('dotenv').config();

// to use in development
const devConfig = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT
};

// to use in production
// process.env.DATABASE_URL comes from Heroku add-on to connect to a postgres cloud db
const prodConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
      } 
}

const pool = new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig);

module.exports = pool;
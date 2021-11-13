const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'stronghold',
    database: 'ecommerce_project',
    host: 'localhost',
    port: 5432
})

module.exports = pool;
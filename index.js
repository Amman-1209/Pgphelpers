const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const pgp = require('pg-promise')();


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Create a table with 10 columns
const cs = new pgp.helpers.ColumnSet([
    'name', 'email', 'age', 'address', 'city', 'state', 'country', 'zipcode', 'phone'
], { table: 'users' });

async function createUsersTable() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100),
                age INT,
                address VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                country VARCHAR(100),
                zipcode VARCHAR(20),
                phone VARCHAR(20)
            )
        `;
        await db.none(createTableQuery);
        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating users table:', error.message || error);
    }
}

app.get('/create', createUsersTable, (req, res) => {
    res.send('Table creation initiated');
});

// Endpoint to get all users
app.get('/users', async (req, res) => {
    try {
        const selectQuery = 'SELECT * FROM users';
        const result = await db.any(selectQuery);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || error });
    }
});

// Endpoint to insert data into the 'users' table
app.post('/users', async (req, res) => {
    try {
        const insertQuery = pgp.helpers.insert(req.body, cs) + ' RETURNING *';
        const result = await db.one(insertQuery);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || error });
    }
});

// Endpoint to update data in the 'users' table
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateQuery = pgp.helpers.update(req.body, cs) + ' WHERE id = $1 RETURNING *';
        const result = await db.one(updateQuery, id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || error });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

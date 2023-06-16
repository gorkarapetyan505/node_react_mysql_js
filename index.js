import express from "express";
import { createPool } from "mysql2";
import { createConnection } from "mysql2";

const pool = createPool({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
});
const app = express()

app.use(express.json())

app.get("/students", (req, res) => {
    pool.query("SELECT students.id, students.name , students.surname, students.age , students.email,groups1.name  AS groupName FROM students INNER JOIN groups1 ON groups1.id = students.groupId", (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Error retrieving data from database' });
            return;
        }

        res.send(results);
    })
})

app.get("/students/:id", (req, res) => {
    const Id = req.params.id;
    // console.log(Id)
    pool.query("SELECT students.id, students.name , students.surname, students.age , students.email,groups1.name  AS groupName FROM students INNER JOIN groups1 ON groups1.id = students.groupId WHERE students.id = ? ", [Id], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Error retrieving data from database' });
            return;
        }
        res.send(results[0]);
    })
})

app.post("/students", (req, res) => {
    const { name, surname, age, email, groupId } = (req.body)
    pool.query(
        'INSERT INTO students (name, surname, age, email , groupId) VALUES (?, ?, ?, ? , ?)',
        [name, surname, age, email, groupId],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Error inserting data into database' });
                return;
            }
            res.send({ message: 'Data inserted successfully' });
        }
    );
})

app.delete("/students/:id", (req, res) => {
    const Id = req.params.id;
    pool.query(
        'DELETE FROM students WHERE id = ?',
        [Id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.send({ bool: false });
                return;
            }

            res.send({ bool: true });
        }
    );
})

app.get("/groups", (req, res) => {
    pool.query("SELECT * FROM groups1", (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error retrieving data from database' });
            return;
        }
        console.log(results)
        res.send(results);
    })
})

app.delete("/groups/:id", (req, res) => {
    const Id = req.params.id;

    pool.query('DELETE FROM students WHERE groupId = ?', [Id], (error, result) => {
        if (error) {
            console.error('Error deleting associated records:', error);
            res.status(500).send({ bool: false });
            return;
        }
        pool.query(
            'DELETE FROM groups1 WHERE id = ?',
            [Id],
            (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.send({ bool: false });
                    return;
                }
                res.send({ bool: true });
            }
        );
    });

})

app.post("/groups", (req, res) => {
    const { name } = (req.body)
    pool.query(
        'INSERT INTO groups1 (name) VALUES (?)',
        [name],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Error inserting data into database' });
                return;
            }
            res.send({ message: 'Data inserted successfully' });
        }
    );
})
app.get("/groups/:id", (req, res) => {
    const Id = req.params.id;
    // console.log(Id)
    pool.query("SELECT * FROM groups1  WHERE groups1.id = ? ", [Id], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Error retrieving data from database' });
            return;
        }
        pool.query("SELECT students.id, students.name , students.surname, students.age , students.email,groups1.name  AS groupName FROM students INNER JOIN groups1 ON groups1.id = students.groupId WHERE groupId = ? ", [Id], (err, resultStudent) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Error retrieving data from database' });
                return;
            }
            console.log(results[0])
            res.send({ group: results[0], students: resultStudent });
        })
    })
})

app.listen(process.env.PORT || 3003)
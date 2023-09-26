'use strict';
const express = require('express');
const { checkDbConnection } = require('./config.js'); // Adjust the path as needed
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 8080; // Specify the port to listen on

app.use(express.json());
app.use(cors());
// Define a route to save user data
// app.post('/users', async (req, res) => {
//   try {
//     const pool = await checkDbConnection();
//     const {  name, Company, Email, password } = req.body;
    
//     const request = pool.request();
//     request
      
//       .input('name', sql.VarChar(50), name)
//       .input('Company', sql.VarChar(50), Company)
//       .input('Email', sql.VarChar(50), Email)
//       .input('Password', sql.VarChar(50), password);

//     const query = 'INSERT INTO VIKASH (name, Company, Email ,Password) VALUES (@name, @Company, @Email, @Password)';
//     const result = await request.query(query);
// console.log(query);
//     res.status(201).json({ msg: 'User data saved successfully' });
//   } catch (error) {
//     console.error('Error saving user data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



app.post('/insertOrUpdateUser', async (req, res) => {
  try {
    const { varValue, name, Company, Email, password } = req.body;

    // Check if varValue is 0 (insert) or non-zero (update)
    const isInsert = varValue === 0;

    const pool = await checkDbConnection();
    const request = pool.request();

    // Call the stored procedure to insert or update a user based on varValue
    const result = await request
      .input('var', sql.Int, varValue)
      .input('name', sql.VarChar(50), name)
      .input('Company', sql.VarChar(50), Company)
      .input('Email', sql.VarChar(50), Email)
      .input('Password', sql.VarChar(50), password)
      .execute('skope.Insert_update_VIKASH');

    const message = isInsert ? 'User created successfully' : 'User updated successfully';

    res.status(200).json({ message, data: result.recordset });
  } catch (error) {
    console.error('Error inserting/updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});











app.get('/getuser', async (req, res) => {
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const query = 'SELECT id, name, Company, Email, password FROM VIKASH';
    const result = await request.query(query);

    // Log the SQL query
    console.log('SQL Query:', query);

    // Log each row in the result
    result.recordset.forEach((row) => {
      console.log('User Data:', row);
    });

    // Send the retrieved user data as a JSON response
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// edit user edit api first step starting to get api 


app.get('/getuser/:id', async (req, res) => {
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const userId = req.params.id;

    const query = 'SELECT id, name, Company, Password FROM VIKASH WHERE id = @userId';
    request.input('userId', sql.Int, userId); // Assuming 'id' is an integer

    const result = await request.query(query);

    if (result.recordset.length === 1) {
      const user = result.recordset[0];
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Define a PUT route to update user data
app.put('/updateuser/:id', async (req, res) => {
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const userId = req.params.id;
    const { name, Company, password } = req.body;

    // Construct SQL query to update user by ID
    const query = `
      UPDATE VIKASH
      SET name = @name, Company = @Company, Password = @password
      WHERE id = @userId
    `;

    request.input('name', sql.VarChar(50), name);
    request.input('Company', sql.VarChar(50), Company);
    request.input('password', sql.VarChar(50), password);
    request.input('userId', sql.Int, userId);

    // Execute the SQL query
    const result = await request.query(query);

    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// edit user edit api first step ending to get api 


// delete api starting here 


// Define a DELETE route to delete a user by ID
app.delete('/deleteuser/:id', async (req, res) => {
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const userId = req.params.id;

    const query = `DELETE FROM VIKASH WHERE id = @userId`;
    request.input('userId', sql.Int, userId); // Assuming 'id' is an integer

    const result = await request.query(query);

    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// delete api starting ending



// Start the server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  checkDbConnection()
});

const express = require('express')
const validator = require('validator')
const { response } = require('express')
const {createRecipe, getRecipes, getRecipe} = require('../data/tasteBudsDb')

// USER IMPORTS
const {tasteBudsPoolPromise} = require('../data/connectionDb')
const {generateHash} = require('../security/security')

const tasteBudsRouter = express.Router()

tasteBudsRouter.get('/', (request, response) => {
    console.log('Running /tastebuds')
    response.send('tasteBudsRouter: home ...')
})

tasteBudsRouter.post('/recipe', async (request,response) => {
    console.log('Inside POST /recipe...')
    const body = request.body
    console.log(body)
    try {
        const insertInfo = await createRecipe(body)
        console.log(insertInfo)
        response.status(201).send(insertInfo)
    } catch(error) {
        response.status(400).send(error)
    }
})

tasteBudsRouter.get('/recipe', async (request,response) => {
    console.log('Inside GET /recipe...')
    try {
        const recipes = await getRecipes()
        response.send({recipes})
    } catch(error) {
        response.status(400).send(error)
    }
})

tasteBudsRouter.get('/recipe/:id', async (request, response) => {
    console.log('Inside GET /recipe/:id...')
    const id = request.params.id
    console.log(id)
    try {
        const recipe = await getRecipe(id)
        response.send(recipe)
    } catch(error) {
        response.status(400).send(error)
    }
})



// ====================
// USER
// ====================

tasteBudsRouter.post('/user', async (request, response) => {
    console.log('\nRunning POST /user');
    const username = request.body.username; // Must be at least 2 characters
    const password = request.body.password; // Must be at least 4 characters
    const email = request.body.email;
    const access = "auth";
  
    if (username.length < 2) {
      const error = `Username '${username}' is shorter than 2 characters!`;
      console.log(error);
      response.status(400).send({ error });
    }
    if (password.length < 4) {
      const error = `Password '${password}' is shorter than 4 characters!`;
      console.log(error);
      response.status(400).send({ error });
    }
    if (!validator.isEmail(email)) {
      const error = `Email ${email} is not a valid email!`;
      console.log(error);
      response.status(400).send({ error });
    };
  
    console.log('username', username);
    console.log('password', password);
    console.log('email', email);
    console.log('access', access);
  
    try {
      const passwordHash = await generateHash(password);
      const userResult = await tasteBudsPoolPromise.query(`INSERT INTO user (username,password,email) VALUES ('${username}','${passwordHash}','${email}')`);
      if (userResult[0].affectedRows !== 1) {
        console.log('userResult= ', userResult);
        throw "Could not insert user!";
      }
      const id = userResult[0].insertId;
      console.log('id= ', id);
  
      const user = { id, username, email };
      response.status(201).send({ user });
  
    } catch (error) {
      console.log(error);
      response.status(400).send();
    }
  });
  
  tasteBudsRouter.get('/user', async (request, response) => {
    console.log('\nRunning GET /user');
    try {
      const rows = await tasteBudsPoolPromise.query('SELECT * FROM user');
      response.send(rows[0]);
    } catch (error) {
      console.log(error);
      response.status(400).send();
    }
  });

  tasteBudsRouter.delete('/user/:id', async (request, response) => {
    console.log('\nRunning DELETE /user/:id');
    const id = request.params.id;
    try {
      const rows = await tasteBudsPoolPromise.query(`DELETE FROM user WHERE id=${id}`);
      console.log(rows[0].affectedRows);
      if (rows[0].affectedRows === 0) {
        response.status(404).send();
      } else {
        const affectedRows = rows[0].affectedRows;
        response.send({ affectedRows : affectedRows });
      }
    } catch (error) {
      console.log(error);
      response.status(400).send();
    }
  });



module.exports = { tasteBudsRouter }
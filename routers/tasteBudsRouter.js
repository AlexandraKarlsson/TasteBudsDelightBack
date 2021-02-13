const express = require('express')
const validator = require('validator')
const { response } = require('express')
const { createRecipe, getRecipes, getRecipe } = require('../data/tasteBudsDb')

// USER IMPORTS
const { tasteBudsPoolPromise } = require('../data/connectionDb')
const bcrypt = require('bcryptjs');
const { generateHash, generateAuthToken, verifyAuthToken } = require('../security/security')
const { authenticate } = require('../security/authenticate')

const tasteBudsRouter = express.Router()

tasteBudsRouter.get('/', (request, response) => {
  console.log('Running /tastebuds')
  response.send('tasteBudsRouter: home ...')
})

tasteBudsRouter.post('/recipe', async (request, response) => {
  console.log('Inside POST /recipe...')
  const body = request.body
  console.log(body)
  try {
    const insertInfo = await createRecipe(body)
    console.log(insertInfo)
    response.status(201).send(insertInfo)
  } catch (error) {
    response.status(400).send(error)
  }
})

tasteBudsRouter.get('/recipe', async (request, response) => {
  console.log('Inside GET /recipe...')
  try {
    const recipes = await getRecipes()
    response.send({ recipes })
  } catch (error) {
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
  } catch (error) {
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
  console.log('username', username);
  console.log('password', password);
  console.log('email', email);
  console.log('access', access);

  if (username.length <= 2) {
    const error = `Username '${username}' is shorter than 3 characters!`;
    console.log(error);
    response.status(400).send({ error });
  }
  else if (password.length <= 2) {
    const error = `Password '${password}' is shorter than 3 characters!`;
    console.log(error);
    response.status(400).send({ error });
  }
  else if (!validator.isEmail(email)) {
    const error = `Email ${email} is not a valid email!`;
    console.log(error);
    response.status(400).send({ error });
  } else {
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
  }
});

tasteBudsRouter.get('/user', async (request, response) => {
  console.log('\nRunning GET /user');
  try {
    const rows = await tasteBudsPoolPromise.query('SELECT * FROM user');
    console.log(rows[0]);
    response.send(rows[0]);
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

// TODO: Add authenticate when deleting user
// tasteBudsRouter.delete('/user/:id', async (request, response) => {
//   console.log('\nRunning DELETE /user/:id');
//   const id = request.params.id;
//   try {
//     const rows = await tasteBudsPoolPromise.query(`DELETE FROM user WHERE id=${id}`);
//     console.log(rows[0].affectedRows);
//     if (rows[0].affectedRows === 0) {
//       response.status(404).send();
//     } else {
//       const affectedRows = rows[0].affectedRows;
//       response.send({ affectedRows: affectedRows });
//     }
//   } catch (error) {
//     console.log(error);
//     response.status(400).send();
//   }
// });

tasteBudsRouter.delete('/user', authenticate, async (request, response) => {
  console.log('\nRunning DELETE /user');
  const id = request.user.id;
  const token = request.token;
  console.log(`id = ${id}`);
  console.log(`token = ${token}`);

  try {
    const tokenResult = await tasteBudsPoolPromise.query(`DELETE FROM token WHERE token='${token}'`);
    console.log(tokenResult[0].affectedRows);
    if (tokenResult[0].affectedRows === 0) {
      throw "Unable to remove token!";
    }

    const userResult = await tasteBudsPoolPromise.query(`DELETE FROM user WHERE id=${id}`);
    console.log(userResult[0].affectedRows);
    if (userResult[0].affectedRows === 0) {
      throw "Unable to remove user!";
    } else {
      const affectedRows = userResult[0].affectedRows;
      response.send({ affectedRows: affectedRows });
    }
  } catch (error) {
    console.log(error);
    response.status(400).send(error);
  }
});

// Prototype for how authenticate middleware should look like
tasteBudsRouter.get('/user/me', async (request, response) => {
  console.log('\nRunning GET /user/me');
  const token = request.header('x-auth');
  console.log('token=', token);

  try {
    verifyAuthToken(token);

    let rows = await tasteBudsPoolPromise.query(`SELECT user.id as id,username,email from user,token WHERE token.token='${token}' AND token.userid=user.id`);
    console.log('rows=', rows[0]);
    if (rows.length === 0) {
      throw `User not found, token '${token}'!`;
    }

    const id = rows[0][0].id;
    const username = rows[0][0].username;
    const email = rows[0][0].email;

    const user = { id, username, email };
    // request.user = user;  
    response.send({ user });
  } catch (error) {
    console.log(error);
    response.status(401).send();
  }
});

// LOGIN!
tasteBudsRouter.post('/user/login', async (request, response) => {
  console.log('\nRunning POST /user/login');
  const pemail = request.body.email;
  const ppassword = request.body.password;
  const access = 'auth';

  console.log('pemail', pemail);
  console.log('ppassword', ppassword);

  try {
    const rows = await tasteBudsPoolPromise.query(`SELECT * FROM user WHERE email='${pemail}'`);
    if (rows[0].length === 0) {
      throw `Login failed, email '${pemail}' not found!`;
    }
    console.log('rows', rows[0]);

    const id = rows[0][0].id;
    const username = rows[0][0].username;
    const password = rows[0][0].password;
    const email = rows[0][0].email;

    console.log('id', id);
    console.log('username', username);
    console.log('password', password);
    console.log('email', email);

    const match = await bcrypt.compare(ppassword, password);
    if (!match) {
      throw `Login failed, password '${ppassword}' incorrectfor email '${email}'!`;
    }

    const token = generateAuthToken(id, access);

    const tokenResult = await tasteBudsPoolPromise.query(`INSERT INTO token (access,token,userid) VALUES ('${access}','${token}',${id})`);
    console.log('tokenResult', tokenResult[0]);
    if (tokenResult[0].affectedRows !== 1) {
      throw "Could not insert token!";
    }

    const user = { id, username, email };
    response.header('x-auth', token).send({ user });
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

// LOGOUT!
tasteBudsRouter.delete('/user/me/token', async (request, response) => {
  console.log('\nRunning DELETE /user/me/token');
  const token = request.header('x-auth');
  console.log('token=', token);

  try {
    const decoded = verifyAuthToken(token);
    // console.log('decoded=',decoded);
    const id = decoded.id;
    const access = decoded.access;
    // console.log('id=',id);
    // console.log('access=',access);

    const rows = await tasteBudsPoolPromise.query(`SELECT * FROM user WHERE id=${id}`);
    if (rows[0].length === 0) {
      throw `Logout failed, user id '${id}' not found!`;
    }

    const username = rows[0][0].username;
    const email = rows[0][0].email;

    const tokenResult = await tasteBudsPoolPromise.query(`DELETE FROM token WHERE token='${token}' AND access='${access}'`);
    // console.log('tokenResult=',tokenResult);
    if (tokenResult[0].affectedRows !== 1) {
      throw `Could not remove token, token='${token}' and  access='${access}' not found!`;
    }
    const user = { id, username, email };
    response.send({ user });
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});



module.exports = { tasteBudsRouter }
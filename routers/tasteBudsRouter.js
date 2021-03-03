const express = require('express')
const { response } = require('express')
const { createRecipe, getRecipes, getRecipe, deleteRecipe, createUser, getUsers, deleteUser, loginUser, logoutUser, changeUsername } = require('../data/tasteBudsDb')

// USER IMPORTS
const { authenticate } = require('../security/authenticate')

const tasteBudsRouter = express.Router()

tasteBudsRouter.get('/', (request, response) => {
  console.log('Running /tastebuds')
  response.send('tasteBudsRouter: home ...')
})

tasteBudsRouter.post('/recipe', authenticate, async (request, response) => {
  console.log('Inside POST /recipe...')
  const body = request.body;
  const token = request.token;
  const userId = request.user.id;

  console.log(body)
  console.log(userId)

  if (token != null) {
    try {
      const insertInfo = await createRecipe(body, userId)
      console.log(insertInfo)
      response.status(201).send(insertInfo)
    } catch (error) {
      response.status(400).send(error)
    }
  } else {
    response.status(400).send('Something went wrong!')
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
  console.log(`recipeid = ${id}`)
  try {
    const recipe = await getRecipe(id)
    response.send(recipe)
  } catch (error) {
    response.status(400).send(error)
  }
})

tasteBudsRouter.delete('/recipe/:id', authenticate, async (request, response) => {
  console.log('Inside DELETE /recipe/:id...')
  const recipeId = request.params.id
  const userId = request.user.id;
  console.log(`recipeid = ${recipeId}`)
  console.log(`userId = ${userId}`)
  try {
    const result = await deleteRecipe(recipeId,userId)
    console.log(result);
    response.send(result)
  } catch (error) {
    console.log(error);
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
  console.log('username', username);
  console.log('password', password);
  console.log('email', email);

  try {
    const user = await createUser(username, password, email)
    response.status(201).send(user);
  } catch (error) {
    response.status(400).send(error);
  }
});

tasteBudsRouter.get('/user', async (request, response) => {
  console.log('\nRunning GET /user');
  try {
    const users = await getUsers();
    response.send(users);
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

tasteBudsRouter.delete('/user', authenticate, async (request, response) => {
  console.log('\nRunning DELETE /user');
  const id = request.user.id;
  console.log(`id = ${id}`);

  try {
    const result = await deleteUser(id);
    console.log(result);
    response.send(result);
  } catch (error) {
    response.status(400).send(error);
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
    var userAndToken = await loginUser(pemail, ppassword, access);
    const token = userAndToken.token;
    console.log(token);
    const user = userAndToken.user
    console.log(user);
    response.header('x-auth', token).send({ user });
  } catch (error) {
    response.status(400).send();
  }
});

// LOGOUT!
tasteBudsRouter.delete('/user/me/token', authenticate, async (request, response) => {
  console.log('\nRunning DELETE /user/me/token');
  const token = request.header('x-auth');
  console.log('token=', token);

  try {
    const user = await logoutUser(token); 
    response.send({ user });
  } catch (error) {
    response.status(400).send('Could not log out user.');
  }
});

tasteBudsRouter.put('/user/username', authenticate, async (request, response) => {
  console.log('\nRunning UPDATE /user/username');
  const userId = request.user.id;
  const username = request.body.username;
  console.log('userId=', userId);
  console.log('username=', username);

  try {
    const result = await changeUsername(userId, username);
    response.status(204).send(result);
  } catch(error) {
    response.status(400).send(error);
  }
});

module.exports = { tasteBudsRouter }




// Prototype for how authenticate middleware should look like
// tasteBudsRouter.get('/user/me', async (request, response) => {
//   console.log('\nRunning GET /user/me');
//   const token = request.header('x-auth');
//   console.log('token=', token);

//   try {
//     verifyAuthToken(token);

//     let rows = await tasteBudsPoolPromise.query(`SELECT user.id as id,username,email from user,token WHERE token.token='${token}' AND token.userid=user.id`);
//     console.log('rows=', rows[0]);
//     if (rows.length === 0) {
//       throw `User not found, token '${token}'!`;
//     }

//     const id = rows[0][0].id;
//     const username = rows[0][0].username;
//     const email = rows[0][0].email;

//     const user = { id, username, email };
//     // request.user = user;  
//     response.send({ user });
//   } catch (error) {
//     console.log(error);
//     response.status(401).send();
//   }
// });






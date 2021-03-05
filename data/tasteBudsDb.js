const { tasteBudsPoolPromise } = require('./connectionDb')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const { generateHash, generateAuthToken, verifyAuthToken } = require('../security/security')

const createRecipe = async (recipe, userId) => {

  console.log('Inside createRecipe SAFE...')

  let connection = null;
  try {
    connection = await tasteBudsPoolPromise.getConnection();
    await connection.beginTransaction();

    // Add row to recipe table
    var recipeInfo = recipe.overview
    recipeInfo['userId'] = userId;
    console.log(recipeInfo)

    let result = await tasteBudsPoolPromise.query('INSERT INTO recipe SET ?', recipeInfo)
    console.log(result)
    const recipeId = result[0].insertId

    // Add rows to ingredient table
    recipe.ingredients.forEach(async (ingredient, index) => {
      // Addera foreign key
      const ingredientInfo = { ordernumber: index, ...ingredient, 'recipeid': recipeId }
      console.log(ingredientInfo)

      // Run sql insert
      const result = await tasteBudsPoolPromise.query('INSERT INTO ingredient SET ?', ingredientInfo)
      console.log(result)
    });

    // Add row/rows to instruction table
    const instructionsInfo = []
    recipe.steps.forEach((instruction, index) => {
      instructionsInfo.push([index, instruction.description, recipeId])
    })
    console.log(instructionsInfo)

    let query = 'INSERT INTO instruction (ordernumber,description,recipeid) VALUES ?'
    result = await tasteBudsPoolPromise.query(query, [instructionsInfo])
    console.log(result)

    // Add row/rows to image table
    const imagesInfo = []
    const imageFileNames = []
    recipe.images.forEach((image, index) => {
      const imageName = `${recipeId}_recipeimage_${index}.${image.extention}`
      imagesInfo.push([index, imageName, recipeId])
      imageFileNames.push(imageName)
    })
    console.log(imagesInfo)

    query = 'INSERT INTO image (ordernumber,name,recipeid) VALUES ?'
    result = await tasteBudsPoolPromise.query(query, [imagesInfo])
    console.log(result)

    await connection.commit();
    return {
      recipeId: recipeId,
      imageFileNames: imageFileNames
    }
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
}


const getRecipes = async () => {
  console.log('Inside getRecipes')

  const query = 'SELECT recipe.*, image.*, user.username FROM recipe, image, user WHERE user.id=recipe.userid AND recipe.id=image.recipeid AND image.ordernumber=0'
  const result = await tasteBudsPoolPromise.query(query)
  console.log(result[0])
  return result[0]
}

const selectAllInTable = async (tableName, columnName, columnValue, sortColumnName) => {
  let query
  if (sortColumnName == null) {
    query = `SELECT * FROM ${tableName} WHERE ${columnName}=${columnValue}`
  } else {
    query = `SELECT * FROM ${tableName} WHERE ${columnName}=${columnValue} ORDER BY ${sortColumnName}`
  }
  const result = await tasteBudsPoolPromise.query(query)
  // console.log(result[0])
  return result[0];
}

const getRecipe = async (id) => {
  console.log('Inside getRecipe')

  const overviewResult = await selectAllInTable('recipe', 'id', id, null)
  // console.log(overviewResult[0])
  const overview = overviewResult[0]
  console.log(overview)

  const ingredientResult = await selectAllInTable('ingredient', 'recipeid', id, 'ordernumber')
  // console.log(ingredientResult[0])
  let ingredients = []
  ingredientResult.forEach((ingredient) => {
    console.log(ingredient)
    ingredients.push(ingredient)
  })

  const instructionResult = await selectAllInTable('instruction', 'recipeid', id, 'ordernumber')
  // console.log(instructionResult[0])
  let instructions = []
  instructionResult.forEach((instruction) => {
    console.log(instruction)
    instructions.push(instruction)
  })

  const imageResult = await selectAllInTable('image', 'recipeid', id, 'ordernumber')
  // console.log(imageResult[0])
  let images = []
  imageResult.forEach((image) => {
    console.log(image)
    images.push(image)
  })

  return { overview, ingredients, instructions, images }
}

const deleteRecipe = async (recipeId, userId) => {
  try {
    const recipeResult = await tasteBudsPoolPromise.query(`DELETE FROM recipe WHERE id=${recipeId} AND userid=${userId}`);
    console.log(recipeResult[0].affectedRows);
    if (recipeResult[0].affectedRows === 0) {
      throw "Unable to remove recipe!";
    } else {
      return `Recipe with id=${recipeId} deleted!`;
    }
  } catch (error) {
    throw error;
  }
}




/*------- USER -------*/

// TODO: validation, move to a separate file? 

const validateEmail = (email) => {
  if (!validator.isEmail(email)) {
    const error = `Email ${email} is not a valid email!`
    console.log(error)
    throw error
  }
}

const validateUsername = (username) => {
  if (username.length <= 2) {
    const error = `Username '${username}' is shorter than 3 characters!`
    console.log(error)
    throw error
  }
}

const validatePassword = (password) => {
  if (password.length <= 2) {
    const error = `Password '${password}' is shorter than 3 characters!`
    console.log(error)
    throw error
  }
}



const createUser = async (username, password, email) => {

  try {
    validateEmail(email);
    validateUsername(username);
    validatePassword(password);
    const passwordHash = await generateHash(password)
    const userResult = await tasteBudsPoolPromise.query(`INSERT INTO user (username,password,email) VALUES ('${username}','${passwordHash}','${email}')`)
    if (userResult[0].affectedRows !== 1) {
      console.log('userResult= ', userResult)
      throw "Could not insert user!"
    }
    const id = userResult[0].insertId
    console.log('id= ', id)

    const user = { id, username, email }
    return user;

  } catch (error) {
    console.log(error)
    throw error
  }

}

const getUsers = async () => {
  const rows = await tasteBudsPoolPromise.query('SELECT * FROM user');
  console.log(rows[0]);
  const users = rows[0];
  return users;
}

const deleteUser = async (userId) => {
  try {
    const userResult = await tasteBudsPoolPromise.query(`DELETE FROM user WHERE id=${userId}`);
    console.log(userResult[0].affectedRows);
    if (userResult[0].affectedRows === 0) {
      throw "Could not delete user or user not found!";
    }
    return "User successfully deleted!";
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const loginUser = async (pemail, ppassword, access) => {
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
      throw `Login failed, password '${ppassword}' incorrect for email '${email}'!`;
    }

    const token = generateAuthToken(id, access);

    const tokenResult = await tasteBudsPoolPromise.query(`INSERT INTO token (access,token,userid) VALUES ('${access}','${token}',${id})`);
    console.log('tokenResult', tokenResult[0]);
    if (tokenResult[0].affectedRows !== 1) {
      throw "Could not insert token!";
    }

    return result = { user: { id, username, email }, token: token };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const logoutUser = async (token) => {
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
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const changeUsername = async (userId, username) => {
  try {
    validateUsername(username)
    const result = await tasteBudsPoolPromise.query(`UPDATE user SET username='${username}' WHERE user.id=${userId}`)
    if (result[0].affectedRows !== 1) {
      throw `Could not rename username for userid = ${userId}`
    }
    return "Username successfully changed!";
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const changePassword = async (userId, oldPassword, newPassword, newRePassword) => {
  try {
    // validate oldpassword
    validatePassword(oldPassword);

    // Check that the oldPassword match
    let result = await tasteBudsPoolPromise.query(`SELECT password FROM user WHERE id=${userId}`);
    const oldPasswordHash = result[0][0].password;
    const match = await bcrypt.compare(oldPassword, oldPasswordHash);
    if (!match) {
      throw "Old password incorrect!";
    }

    // Check newPassword newRePassword is the same and different than the old
    if (newPassword !== newRePassword) {
      throw "New password do not match!"
    }

    // validate newPassword
    validatePassword(newPassword);

    // Create hash of password
    const newPasswordHash = await generateHash(newPassword);

    // Insert hashed password into tabel user
    result = await tasteBudsPoolPromise.query(`UPDATE user SET password='${newPasswordHash}' WHERE id=${userId}`);
    if (result[0].affectedRows !== 1) {
      throw "Could not change password!"
    }
    // TODO: Should we also logout user?
    return "Password successfully changed!"
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createRecipe,
  getRecipes,
  getRecipe,
  deleteRecipe,
  createUser,
  getUsers,
  deleteUser,
  loginUser,
  logoutUser,
  changeUsername,
  changePassword,
}
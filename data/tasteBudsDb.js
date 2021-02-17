const {tasteBudsPoolPromise} = require('./connectionDb')
const validator = require('validator')
const { generateHash, generateAuthToken, verifyAuthToken } = require('../security/security')


const createRecipe = async (recipe) => {
    console.log('Inside createRecipe...')

    // Add row to recipe table
    const recipeInfo = recipe.overview
    console.log(recipeInfo)
    let result = await tasteBudsPoolPromise.query('INSERT INTO recipe SET ?', recipeInfo)
    console.log(result)
    const recipeId = result[0].insertId

    // Add rows to ingredient table
    recipe.ingredients.forEach(async (ingredient,index) => {
        // Addera foreign key
        const ingredientInfo = {ordernumber: index, ...ingredient,'recipeid' : recipeId }
        console.log(ingredientInfo)

        // Run sql insert
        const result = await tasteBudsPoolPromise.query('INSERT INTO ingredient SET ?', ingredientInfo)
        console.log(result)       
    });
   
    // Add row/rows to instruction table
    const instructionsInfo = []
    recipe.steps.forEach((instruction,index) => {
        instructionsInfo.push([index,instruction.description,recipeId])
    })
    console.log(instructionsInfo)

    let query = 'INSERT INTO instruction (ordernumber,description,recipeid) VALUES ?'
    result = await tasteBudsPoolPromise.query(query, [instructionsInfo])
    console.log(result)
 
    // Add row/rows to image table
    const imagesInfo = []
    const imageFileNames = []
    recipe.images.forEach((image,index) => {
        const imageName = `${recipeId}_recipeimage_${index}.${image.extention}`
        imagesInfo.push([index,imageName,recipeId])
        imageFileNames.push(imageName)
    })
    console.log(imagesInfo)

    query = 'INSERT INTO image (ordernumber,name,recipeid) VALUES ?'
    result = await tasteBudsPoolPromise.query(query, [imagesInfo])
    console.log(result)

    return {
        recipeId : recipeId,
        imageFileNames : imageFileNames
    }
}

const getRecipes = async () => {
    console.log('Inside getRecipes')

    const query = 'SELECT * FROM recipe, image WHERE recipe.id=image.recipeid AND image.ordernumber=0'
    const result =  await tasteBudsPoolPromise.query(query)
    console.log(result[0])
    return result[0]
}

const selectAllInTable = async (tableName, columnName, columnValue,sortColumnName) => {
    let query
    if(sortColumnName==null) {
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

    const overviewResult = await selectAllInTable('recipe','id',id,null)
    // console.log(overviewResult[0])
    const overview = overviewResult[0]
    console.log(overview)
    
    const ingredientResult = await selectAllInTable('ingredient','recipeid',id,'ordernumber')
    // console.log(ingredientResult[0])
    let ingredients = []
    ingredientResult.forEach((ingredient) => {
        console.log(ingredient)
        ingredients.push(ingredient)
    })

    const instructionResult = await selectAllInTable('instruction','recipeid',id,'ordernumber')
    // console.log(instructionResult[0])
    let instructions = []
    instructionResult.forEach((instruction) => {
        console.log(instruction)
        instructions.push(instruction)
    })

    const imageResult = await selectAllInTable('image','recipeid',id,'ordernumber')
    // console.log(imageResult[0])
    let images = []
    imageResult.forEach((image) => {
        console.log(image)
        images.push(image)
    })

    return {overview,ingredients,instructions,images}
}

const createUser = async (username, password, email) => {
    if (username.length <= 2) {
      const error = `Username '${username}' is shorter than 3 characters!`
      console.log(error)
      throw error
    }
    else if (password.length <= 2) {
      const error = `Password '${password}' is shorter than 3 characters!`
      console.log(error)
      throw error
    }
    else if (!validator.isEmail(email)) {
      const error = `Email ${email} is not a valid email!`
      console.log(error)
      throw error
    } else {
      try {
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
  }

module.exports = {createRecipe, getRecipes, getRecipe, createUser}
const {tasteBudsPoolPromise} = require('./connectionDb')


const createRecipe = async (recipe) => {
    console.log('Inside createRecipe')
    console.log('Not implemented yet')

    // Add row to recipe table
    const recipeInfo = recipe.overview
    console.log(recipeInfo)
    let result = await tasteBudsPoolPromise.query('INSERT INTO recipe SET ?', recipeInfo)
    console.log(result)
    const recipeId = result[0].insertId

    // Add rows to ingredient table
    recipe.ingredients.forEach(async ingredient => {
        // Addera foreign key
        const ingredientInfo = { ...ingredient,'recipeid' : recipeId }
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
    recipe.images.forEach((image,index) => {
        imagesInfo.push([index,image.name,recipeId])
    })
    console.log(imagesInfo)

    query = 'INSERT INTO image (ordernumber,name,recipeid) VALUES ?'
    result = await tasteBudsPoolPromise.query(query, [imagesInfo])
    console.log(result)
}

const getRecipes = async () => {
    console.log('Inside getRecipes')
    console.log('Not implemented yet')
}

module.exports = {createRecipe, getRecipes}
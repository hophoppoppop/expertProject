const mongoose = require('mongoose');

const Expense = require('../models/expense.model').Expense;
const Category = require('../models/expense.model').Category;
const redis = require('redis');

const { buildSchema } = require('graphql');
const expressGraphQL = require('express-graphql');
// const client = redis.createClient();

const schema = buildSchema(`
type Category {
    id: String,
    name: String
}
type Expense {
    id: String,
    title: String,
    money: Int,
    category: Category
}
type Query {
    expenses: [Expense],
    expense(id: String): Expense,
    categories: [Category],
    category(id: String): Category
}
type Mutation {
    deleteExpense(id: String!): Expense,
    updateExpense(id: String!,title: String, money: Int): Expense,
    insertExpense(title: String!, species: String!): Expense,
    deleteCategory(id: String!): Category,
    updateCategory(id: String!,name: String): Category,
    insertCategory(name: String!): Category
}
`);

const root = {
    expenses: async ()=>{
        updateExpenseRedis();
        return await Expense.find({}).populate('category');
    },
    expense: async ({id})=>{
        return await Expense.findById(id).populate('category')
    },
    deleteExpense: async ({id})=>{
        let temp = await Expense.findById(id).populate('category');
        await Expense.deleteOne({_id: id})
        updateExpenseRedis();
        return temp;
    },
    updateExpense: async ({id,title,money})=>{
        const updateExpense = {};
        if(title)
            updateExpense.title = title;
           
        if(money)
            updateExpense.money = money;
        await Expense.updateOne({_id: id},{$set:updateExpense});
        updateExpenseRedis();
        return await Expense.findById(id).populate('category');
    },
    insertExpense: async ({title,money})=>{
        const newExpense = new Expense({
            title:title,
            money:money
        });
        const result = await newExpense.save();
        updateExpenseRedis();
        return result;
    },
    categories: async ()=>{
        updateCategoryRedis();
        return await Category.find({})
    },
    category: async ({id})=>{
        return await Category.findById(id)
    },
    deleteCategory: async ({id})=>{
        let temp = await Category.findById(id)
        await Category.deleteOne({_id: id})
        updateCategoryRedis();
        return temp;
    },
    updateCategory: async ({id,name})=>{
        const updateCategory = {};
        if(name)
            updateCategory.name = name;
           
        await Category.updateOne({_id: id},{$set:updateCategory});
        updateCategoryRedis();
        return await Category.findById(id);
    },
    insertCategory: async ({name})=>{
        const newCategory = new Category({
            name:name,
        });
        const result = await newCategory.save();
        updateCategoryRedis();
        return result;
    },

}

const graphql = expressGraphQL({
    schema: schema,
    rootValue: root,
    graphiql: true
})

const remove = async (req,res)=>{
    try{
        let result = await Expense.deleteOne({_id: req.body.id});
        updateExpenseRedis();
        res.json({
            result: result
        });
    }catch(err)
    {
        res.status(500).json({
            message: 'Error: '+err
        });
    }
}

const update = async (req,res)=>{
    try{
        if(req.body.update)
        {
            let result = await Expense.updateOne({_id: req.body.id},{$set:req.body.update});
            updateExpenseRedis();
            res.json({result:result});
        }else{
            res.send("Change Update Empty");
        }
    }catch(err)
    {
        res.status(500).json({
            message: 'Error: '+err
        });
    }
}

const create = async (req,res)=>{
    try{
        let {title,money,category} = req.body;
        if(title && money && category)
        {
            const findCategory = await Category.findOne({
                name: category  
            });
            let idCategory = "";
            if(!findCategory)
            {
                const newCategory = new Category({
                    name:category,
                });
                const result = await newCategory.save();
                idCategory = result._id;
            }else{
                idCategory = findCategory._id;
            }
            const newExpense = new Expense({
                title:title,
                money:money,
                category: idCategory
            });
            const result = await newExpense.save();
            updateExpenseRedis();
            updateCategoryRedis();
            res.json({
                result:result
            });
        }else{
            res.json({
                error:"Some Value is Empty",
            })
        }
    }catch(err)
    {
        res.status(500).json({
            message: 'Error: '+err
        });
    }
}

const updateRedis = (title,json)=>
{
    // client.setex(title,300, json);
}

const updateExpenseRedis = async ()=>{
    const jsonExpenses = JSON.stringify(await Expense.find({}).populate('category'));
    // updateRedis('expenses',jsonExpenses);
}

const updateCategoryRedis = async ()=>{
    const jsonCategory = JSON.stringify(await Category.find({}));
    // updateRedis('category',jsonCategory);
}

const getAll = (req,res)=>{
    try{
    
        let Expenses = "";

        client.get("expenses", async (err, result)=>{
            if(result)
            {
                // console.log(result);
                Expenses = JSON.parse(result);
            }else{
                Expenses = await Expense.find({}).populate('category');
                updateExpenseRedis();
            }
            res.json({
                result: Expenses
            });
        });
    }catch(err)
    {
        res.status(500).json({
            message: 'Error: '+err
        });
    }
}

const get = async(req,res)=>{
    if(req.body.id)
    {
        const expense = await Expense.findOne({
            id: req.body.id
        })
        res.json({
            result:expense,
        })
    }else{
        getAll(req,res);
    }
}

module.exports = {
    remove,update,create,get,graphql
}
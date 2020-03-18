const expense = require('../controllers/expense.controller');

const routes = (app) => {
    // app.get('/pets', pets.getAll);
    // app.get('/pets/:id', pets.get);
    // app.get('/pets', pets.findAll);
    // app.put('/pets/:id',pets.update);
    // app.get('/pets-redis', pets.findAllRedis);

    app.post('/expense', expense.create);
    app.get('/expense', expense.get);
    app.delete('/expense',expense.remove);
    app.put('/expense',expense.update);

    app.use('/graphql', expense.graphql);
};

module.exports = routes;
const expense = require('../controllers/expense.controller');

const routes = (app) => {
    app.post('/expense', expense.create);
    app.get('/expense', expense.get);
    app.delete('/expense',expense.remove);
    app.put('/expense',expense.update);

    app.use('/graphql', expense.graphql);
};

module.exports = routes;
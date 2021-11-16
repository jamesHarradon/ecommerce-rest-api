const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');

const cartRouter = require('./routes/cart');
const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');




const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce REST API",
            version: "1.0.0",
            description: "A simple e-commerce API"
        },
        servers: [
            {
                url: "https://jims-ecommerce-rest-api.herokuapp.com/"
            }
        ],
    },
    apis: ["./swagger.yml"]
}

const specs = swaggerJsDoc(options);

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/customer', customersRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
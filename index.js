const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const authRouter = require('./newStructure/routes/auth-route');
const cartRouter = require('./newStructure/routes/cart-route');
const customerRouter = require('./newStructure/routes/customer-route');
const orderRouter = require('./newStructure/routes/order-route');
const productRouter = require('./newStructure/routes/product-route');
const paymentRouter = require('./newStructure/routes/payment-route');
const checkoutRouter = require('./newStructure/routes/checkout-route');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce REST API",
            version: "1.0.0",
            description: "A simple e-commerce API"
        },
        schema: [
            "http",
            "https"
        ],
        servers: [
            {
                url: "https://jims-ecommerce-rest-api.herokuapp.com/",
            }
        ],
    },
    apis: ["./swagger.yml"]
}

const specs = swaggerJsDoc(options);

const app = express();

const origin = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

app.use(compression());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

app.use(express.json());
app.use(cors(origin)); // only needed when not using proxy server
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/checkout', checkoutRouter);

app.use((err, req, res, next) => {
    const { message, status } = err;
    res.status(status || 500).json(message);
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
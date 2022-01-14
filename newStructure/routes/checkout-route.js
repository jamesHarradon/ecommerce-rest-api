const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const isAuthorized = require('../../modules/isAuthorized');

const checkoutRouter = express.Router();

checkoutRouter.post('/:customerId', isAuthorized, async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.body.email,
            line_items: req.body.products.map(product => ({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: product.product_name,
                        images: [product.image]
                    },
                    unit_amount: parseFloat(product.price_per_unit.split('').splice(1).join(''))*100    
                },
                quantity: product.quantity
            })),
            success_url: `${process.env.CLIENT_URL}/checkout-success`,
            cancel_url: `${process.env.CLIENT_URL}/basket`
        });
        res.json({ url: session.url })
    } catch (err) {
        next(err)
    }
})



module.exports = checkoutRouter;
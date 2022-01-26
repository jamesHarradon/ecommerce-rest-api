# codecademy-ecommerce-rest-api
Node/Express REST API to provide typical functionality found in an ecommerce website.  Users can create accounts, view products, add products to a cart, and place/view orders.

## Running and Testing

Visit the live site at [https://jims-ukulele-shop.netlify.app](https://jims-ukulele-shop.netlify.app)

Or go to [https://jims-ecommerce-rest-api.herokuapp.com/api-docs/](https://jims-ecommerce-rest-api.herokuapp.com/api-docs/) to test out using the Swagger UI.


To run locally, `npm install`, then `npm run start`

This project requires a [PostgreSQL](https://www.postgresql.org/) database to be running locally.  Reference the ERD diagram located in the `resources` folder of this repo to view the structure of the tables.  You can use [pgAdmin](https://www.pgadmin.org/) to interact with the database manually. 

You can populate your database with the requisite tables using the database.sql file. 

Ensure to add your own .env variables.

Once the app is running locally, you can access the API at `http://localhost:<your-port>`

You can use various HTTP clients such as [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) 

## Resources
- [REST Architecture](https://www.codecademy.com/articles/what-is-rest)
- [Setting up Postman](https://learning.postman.com/docs/getting-started/settings/)
- [Using pgAdmin](https://www.pgadmin.org/docs/pgadmin4/development/getting_started.html)
- [Postgres Cheat Sheet](https://www.postgresqltutorial.com/postgresql-cheat-sheet/)
- [Documenting your API with Swagger](https://swagger.io/resources/articles/documenting-apis-with-swagger/)

## Options for Extension
- Add additional API endpoints (endpoints for categories, addresses, etc)
- Add ability to maintain multiple carts per user
- Add ability to interact with the API as a guest
CREATE TABLE contacts (
	id SERIAL PRIMARY KEY, 
	address_line1 VARCHAR(100),
	address_line2 VARCHAR(100),
	town VARCHAR(100),
	city VARCHAR(100),
	county VARCHAR(100),
	post_code VARCHAR(10),
	phone VARCHAR(11),
	email VARCHAR(100) UNIQUE
);

CREATE TABLE customers (
	id SERIAL PRIMARY KEY,
	user_name VARCHAR(100) UNIQUE,
	password VARCHAR(10),
	date_created DATE,
	contact_id INTEGER REFERENCES contacts(id)
);

CREATE TABLE orders (
	id SERIAL PRIMARY KEY,
	customer_id INTEGER REFERENCES customers(id),
	order_date DATE,
	total_cost MONEY
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price_per_unit MONEY,
    image VARCHAR(100)
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    created_date DATE,
    total_cost MONEY
);

CREATE TABLE carts_products (
    cart_id INTEGER REFERENCES carts(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    PRIMARY KEY(cart_id, product_id)
);

CREATE TABLE orders_products (
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    PRIMARY KEY(order_id, product_id)
);











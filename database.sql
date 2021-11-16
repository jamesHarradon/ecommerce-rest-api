CREATE TABLE IF NOT EXISTS contacts (
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

CREATE TABLE IF NOT EXISTS payment_details (
	id SERIAL PRIMARY KEY,
	card_type VARCHAR(50),
	card_number CHAR(16),
	expiry_date DATE,
	name_on_card VARCHAR(100),
	security_code CHAR(3)
);

CREATE TABLE IF NOT EXISTS customers (
	id SERIAL PRIMARY KEY,
	user_name VARCHAR(100) UNIQUE,
	password VARCHAR(255),
	date_created DATE,
	contact_id INTEGER,
	first_name VARCHAR(100),
	last_name VARCHAR(100),
	payment_id INTEGER
);

CREATE TABLE IF NOT EXISTS orders (
	id SERIAL PRIMARY KEY,
	customer_id INTEGER,
	order_date DATE,
	total_cost MONEY
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price_per_unit MONEY,
    image VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    created_date DATE,
    total_cost MONEY
);

CREATE TABLE IF NOT EXISTS carts_products (
    cart_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    PRIMARY KEY(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders_products (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    PRIMARY KEY(order_id, product_id)
);

ALTER TABLE customers
ADD FOREIGN KEY(contact_id) REFERENCES contacts(id);

ALTER TABLE customers
ADD FOREIGN KEY(payment_id) REFERENCES payment_details(id);

ALTER TABLE orders
ADD FOREIGN KEY(customer_id) REFERENCES customers(id);

ALTER TABLE carts
ADD FOREIGN KEY(customer_id) REFERENCES customers(id);

ALTER TABLE carts_products
ADD FOREIGN KEY(cart_id) REFERENCES carts(id);

ALTER TABLE carts_products
ADD FOREIGN KEY(product_id) REFERENCES products(id);

ALTER TABLE orders_products
ADD FOREIGN KEY(order_id) REFERENCES orders(id);

ALTER TABLE orders_products
ADD FOREIGN KEY(product_id) REFERENCES products(id);




-- insert fake data values
INSERT INTO products (product_name,price_per_unit, image) VALUES
	 ('Tanglewood TUJ2CE Exotic Java Concert Ukulele', '279.00','https://d1aeri3ty3izns.cloudfront.net/media/66/667864/1200/preview.jpg'),
	 ('Tanglewood Black Walnut Tiare Range Soprano ukulele','55.00','https://mickleburgh.co.uk/wp-content/uploads/2021/06/cff6a6a424dd0c43c26a2f195ba3ff6a8b74bd3b.jpg'),
	 ('Ibanez UICT10 Iceman Ukulele Black','189.00','https://images.guitarguitar.co.uk/cdn/large/160/200325357678025f.jpg'),
	 ('Eno ET 33U Clip-On Ukulele Tuner','10.53','https://m.media-amazon.com/images/I/71Bn8dnAZ2L._AC_SL1500_.jpg'),
	 ('Tiger Ukulele Strap Aztec Style - Adjustable Strap','5.99','https://m.media-amazon.com/images/I/61Wvt7uoR-L._AC_SL1500_.jpg');

INSERT INTO contacts (address_line1,address_line2,town,city,county,post_code,phone,email) VALUES
	 ('76 Baker Close','Wood Park','Grangetown','Southeaston','Bedfordshire','BO32 5FX','07843453939','testone@hotmail.co.uk'),
	 ('73 Letsby Avenue',NULL,'Hedge Green','Hampton','Hampshire','RO40 4TB','01489787657','jeff@hotmale.com'),
	 ('57 Testout Close','Wood Green','Ford',NULL,'Berkshire','BP6 1RH','01234566778','testing@hotmail.co.uk'),
	 ('Flat 8 High Court','12 Oak Street','Quieton',NULL,'Cumbria','HF34 7HE','07777777777','testing@gmail.com'),
	 ('69 Tangle Street',NULL,'Bridgerton','Ipswich','Suffolk','I30 4IB','02980787878','testing1@gmail.com');


INSERT INTO customers (user_name,"password",date_created,contact_id,first_name,last_name,payment_id) VALUES
	 ('tomH50','a9d70b4d90bd895c969d37f26b8e323a:2db19d4387062676f64a7cab65d30a61a2805cdb1835b66fc277751b5389954ded03286c8fcc64586846d9ee940d31114e8378949b9af31de9a9983e4f797077','2020-09-03',NULL,'Tom','Hanks',NULL),
	 ('pitty60','f3b371307ecde7a96317726b452c6415:980339b79b6e2710aa7bc25b6b6279ad3530b117cf46b4fd980970f3fb95932d64d470e822437b5552772c92afe76fcd70d06926831e5299621de2f9b333b0b7','2021-11-12',NULL,'Brad','Pitt',NULL),
	 ('bigwillyf','5c8efcf48b616f9a36346274cb60b9ed:0312ab1cbd624448fd7e11731db2747064fc89595c3ef493a25e30602508c51863d44953787ec71998ddaa0f4991861607851416b243983b6dd01c29faf322e6','2021-11-13',NULL,'Will','Ferrell',NULL),
	 ('jessAlba80','12d90972baa67cad637f39c6f6bcfc01:0dba82c371dd1fac3327de7de97d1ed2ed2e6a851f0ac1eb17b930f310dca839435a421f77dd643a37136f14ceffac107c638b825244553095aff8e3304479ba','2021-11-15',NULL,'Jessica','Alba',NULL),
	 ('sydney90','3084065e84e1733fc86a2b818d0f478a:d477e94cc518536eea00e760fcdfbf54e0912e518b39b655c2a91704988d530f11dbe6a1eb19b803e3fe3f41252fb4d26a42da831b9f68f12d8db5c47b4666d0','2021-01-04',NULL,'Sydney','Sweeney', NULL),
	 ('kane88','14b40db23ad24bc5bcfa083411748c99:e220282b75e657378b8132ea0c0cf49a8a3ef2cf283d4adec97a9bb1fad35f96b145fc436e77ef67a8998b3b471a4b7913da98183e0fac105039dc24d94fcb63','2021-11-11', NULL,'Patrick','Kane', NULL);

INSERT INTO public.payment_details (card_type,card_number,expiry_date,name_on_card,security_code) VALUES
	 ('VISA','2323434343454765','2022-02-01','Mr T Hanks','932'),
	 ('VISA','2134436854344237','2022-08-01','Mr B Pitt','438'),
	 ('VISA','2634766854347437','2022-09-01','Mr W Ferrell','546');











CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(150) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price INT,
    stock_quantity INT,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
('Soda', 'Food & Drinks', 1, 10),
('Chips', 'Food & Drinks', 2, 20),
('FairyTale Zine', 'Magazines & Entertainment', 5, 6),
('Pop Princess EP', 'Magazines & Entertainment', 3, 10),
('Cherry Cherry Boom Boom Chapstick', 'Health & Beauty', 40, 1),
('Rose Glitter Deodorant', 'Health & Beauty', 15, 6);

SELECT * FROM bamazon.products;
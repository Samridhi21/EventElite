CREATE DATABASE IF NOT EXISTS login_html;
USE login_html;

CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM ('admin','student') NOT NULL
);

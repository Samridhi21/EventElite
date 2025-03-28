CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM ('admin','student') NOT NULL
);

INSERT INTO admin (admin_id,name,password)
VALUES(1,'admin','admin');




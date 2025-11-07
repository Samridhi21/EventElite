CREATE DATABASE IF NOT EXISTS login_html;
USE login_html;

CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR (100) NOT NULL,
    role ENUM ('admin','student','faculty') NOT NULL
);

CREATE TABLE student(
     student_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR (100) NOT NULL,
     roll_no VARCHAR (50)NOT NULL,
     class VARCHAR (50) NOT NULL,
     phone VARCHAR (15) NOT NULL,
     father_name VARCHAR (100) NOT NULL,
     email VARCHAR (50) NOT NULL,
     password VARCHAR (100) UNIQUE NOT NULL,
     admin_id INT,
     FOREIGN KEY (admin_id) REFERENCES admin (admin_id) ON DELETE SET  NULL
     );

CREATE TABLE event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    category ENUM ('Sports', 'Entertainment', 'Conference', 'Workshops', 'FDP', 'Expert Talk', 'Cultural Events', 'Other'),
    fee DECIMAL(10,2),
    status ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    image VARCHAR(255)
);

CREATE TABLE faculty (
    faculty_id INT  AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    department VARCHAR(255)
);

 CREATE TABLE registration (
     registration_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      event_id INT NOT NULL,
      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_status ENUM('pending', 'paid') DEFAULT 'pending',
     FOREIGN KEY (student_id) REFERENCES student(student_id),
     FOREIGN KEY (event_id) REFERENCES event(event_id)
    );

CREATE TABLE past_events (
        event_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        description TEXT,
        start_date DATE,
        end_date DATE,
        time TIME,
        venue VARCHAR(255)
     );

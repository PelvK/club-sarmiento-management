<?php
$servername = "localhost";
$username = "vps4_admin_sarmiento";       
$password = "laquevosquieras2022";            
$database = "vps4_clubmanagement_sarmiento";

try {
    $db = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $e) {
    die("Conexión fallida: " . $e->getMessage());
}
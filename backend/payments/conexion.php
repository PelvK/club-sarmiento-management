<?php
$servername = "localhost";
$username = "management_sarmiento";       
$password = "Laquevosquieras-2022";              
$database = "vps4_clubmanagement_sarmiento_prod";

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
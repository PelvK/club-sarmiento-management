<?php
$servername = "localhost";
$username = "vps4_admin_sarmiento";       
$password = "laquevosquieras2022";            
$database = "vps4_clubmanagement_sarmiento";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
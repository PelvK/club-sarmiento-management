<?php
$servername = "localhost";
$username = "management_sarmiento";       
$password = "Laquevosquieras-2022";                
$database = "vps4_clubmanagement_sarmiento_prod";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
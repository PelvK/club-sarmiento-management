<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$sql1 = "SELECT * FROM Quotes WHERE discipline_id IS NULL";
$result1 = $conn->query($sql1);

$quotes = [];

if ($result1->num_rows > 0) {
    while ($row1 = $result1->fetch_assoc()) {

        $quote = [
            "id" => $row1["id"],
            "name" => $row1["name"],
            "price" => $row1["value"],
            "description" => $row1["description"],
            "type" => $row1["type"],
            "duration" => $row1["duration"]
        ];

        $quotes[] = $quote;
    }
}
echo json_encode($quotes);

$conn->close();

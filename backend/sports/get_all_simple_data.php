<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$sql = "SELECT * FROM Disciplines";
$result = $conn->query($sql);

$disciplines = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $discipline = [
            "id" => $row["id"],
            "name" => $row["name"],
            "description" => $row["description"],
            "abbreviation" => $row["abbreviation"],
        ];
        $disciplines[] = $discipline;
    }
}

echo json_encode($disciplines);

$conn->close();
?>

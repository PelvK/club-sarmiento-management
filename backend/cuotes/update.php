<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

$id = isset($input['id']) ? intval($input['id']) : 0;
$name = isset($input['name']) ? $conn->real_escape_string($input['name']) : '';
$description = isset($input['description']) ? $conn->real_escape_string($input['description']) : '';
$price = isset($input['price']) ? floatval($input['price']) : 0;
$duration = isset($input['duration']) ? intval($input['duration']) : 1;

if ($id <= 0 || empty($name)) {
    echo json_encode(["success" => false, "message" => "ID and name are required"]);
    exit();
}

$sql = "UPDATE Quotes SET
        name = '$name',
        description = '$description',
        value = $price,
        duration = $duration
        WHERE id = $id AND type = 'societaria'";

if ($conn->query($sql)) {
    echo json_encode([
        "success" => true,
        "quote" => [
            "id" => $id,
            "name" => $name,
            "description" => $description,
            "price" => $price,
            "duration" => $duration
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating quote: " . $conn->error]);
}

$conn->close();
?>

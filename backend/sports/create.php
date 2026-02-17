<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

file_put_contents("./debug_input.log", print_r($input, true));


if (!isset($input['name'], $input['description'])) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$name = $conn->real_escape_string($input['name']);
$description = $conn->real_escape_string($input['description']);
$quotes = isset($input['quotes']) ? $input['quotes'] : [];

$conn->begin_transaction();

try {
    $sql_insert_sport = "INSERT INTO Disciplines (name, description) VALUES ('$name', '$description')";
    if (!$conn->query($sql_insert_sport)) {
        throw new Exception("Error inserting sport: " . $conn->error);
    }
    $sportId = $conn->insert_id;
    $sports_get = [];
    $sql_insert_quote = "INSERT INTO Quotes (discipline_id, name, description, value, type) VALUES ";
    $values = [];
    foreach ($quotes as $quote) {
        $quoteName = $conn->real_escape_string($quote['name']);
        $quoteDescription = $conn->real_escape_string($quote['description']);
        $quotePrice = isset($quote['price']) ? $conn->real_escape_string($quote['price']) : 0;
        $values[] = "('$sportId', '$quoteName', '$quoteDescription', '$quotePrice', 'deportiva')";
    }

    if (!empty($values)) {
        $sql_insert_quote .= implode(", ", $values);
        if (!$conn->query($sql_insert_quote)) {
            throw new Exception("Error inserting quotes: " . $conn->error);
        }
    }

    $conn->commit();

    $sport = [
        "id" => $sportId,
        "name" => $name,
        "description" => $description,
        "quotes" => $quotes
    ];

    echo json_encode(["success" => true, "sport" => $sport]);

} catch (Exception $e) {

    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>



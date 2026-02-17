<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

file_put_contents("./debug_input.log", print_r($input, true));

$quotes = isset($input['quotes']) ? $input['quotes'] : [];


$conn->begin_transaction();

try {
    echo $quotes;
    echo $cuotes;
    echo $cuote;
    echo $quote;

    $sql_insert_quote = "INSERT INTO Quotes ( name, description, value, duration, type) VALUES ";
    $values = [];
    foreach ($quotes as $quote) {
        $quoteName = $conn->real_escape_string($quote['name']);
        $quoteDescription = $conn->real_escape_string($quote['description']);
        $quotePrice = isset($quote['price']) ? $conn->real_escape_string($quote['price']) : 0;
        $quoteDuration = isset($quote['duration']) ? $conn->real_escape_string($quote['duration']) : 0;
        $values[] = "('$quoteName', '$quoteDescription', '$quotePrice', '$quoteDuration', 'societaria')";
    }

    if (!empty($values)) {
        $sql_insert_quote .= implode(", ", $values);
        if (!$conn->query($sql_insert_quote)) {
            throw new Exception("Error inserting quotes: " . $conn->error);
        }
    }

    $conn->commit();

    $quotes_res[] = [
        "name" => $quoteName,
        "description" => $quoteDescription,
        "price" => $quotePrice,
        "duration" => $quoteDuration,
        "type" => "societaria"
    ];

    echo json_encode(["success" => true, "quotes" => $quotes_res]);

} catch (Exception $e) {

    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>



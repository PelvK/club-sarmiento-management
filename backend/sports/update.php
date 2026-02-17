<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

file_put_contents("./debug_input.log", print_r($input, true));


$id = $conn->real_escape_string($input['id']);
$name = $conn->real_escape_string($input['name']);
$description = $conn->real_escape_string($input['description']);
$quotes = isset($input['quotes']) ? $input['quotes'] : [];

if (!isset($id, $name, $description)) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$conn->begin_transaction();

try {
    $sql_update_sport = "UPDATE Disciplines SET name = '$name', description = '$description' WHERE id = '$id'";
    if (!$conn->query($sql_update_sport)) {
        throw new Exception("Error updating sport: " . $conn->error);
    }
    
    foreach ($quotes as $quote) {
        $quoteId = $conn->real_escape_string($quote['id']);
        $quoteName = $conn->real_escape_string($quote['name']);
        $quoteDescription = $conn->real_escape_string($quote['description']);
        $quotePrice = isset($quote['price']) ? $conn->real_escape_string($quote['price']) : 0;
        // Debugging output

        if ($quoteId) {
            //debug
            file_put_contents("./debug_quotes.log", "Updating quote ID: $quoteId, Name: $quoteName, Description: $quoteDescription, Price: $quotePrice\n", FILE_APPEND);
            // Update existing quote
            $sql_update_quote = "UPDATE Quotes SET name = '$quoteName', description = '$quoteDescription', value = '$quotePrice' WHERE id = '$quoteId'";
            if (!$conn->query($sql_update_quote)) {
                throw new Exception("Error updating quote: " . $conn->error);
            }
        } else {
            //debug
            file_put_contents("./debug_quotes.log", "Inserting new quote, Name: $quoteName, Description: $quoteDescription, Price: $quotePrice\n", FILE_APPEND);
            // Insert new quote
            $sql_insert_quote = "INSERT INTO Quotes (discipline_id, name, description, value, type) VALUES ('$id', '$quoteName', '$quoteDescription', '$quotePrice', 'deportiva')";
            
            
            if (!$conn->query($sql_insert_quote)) {
                throw new Exception("Error inserting quote: " . $conn->error);
            }
            $insertedId = $conn->insert_id;
            $quote['id'] = $insertedId;
            $quotes[] = $quote;
        }
    }

    $sql_select_quotes = "SELECT id FROM Quotes WHERE discipline_id = '$id'";
    $result_select_quotes = $conn->query($sql_select_quotes);
    $existingQuoteIds = [];
    if ($result_select_quotes && $result_select_quotes->num_rows > 0) {
        // Fetch existing quote IDs
        while ($row = $result_select_quotes->fetch_assoc()) {
            $existingQuoteIds[] = $row['id'];
        }
    }
    // Check for quotes that need to be deleted
    foreach ($existingQuoteIds as $existingQuoteId) {
        if (!in_array($existingQuoteId, array_column($quotes, 'id'))) {
            $sql_delete_quote = "DELETE FROM Quotes WHERE id = '$existingQuoteId'";
            if (!$conn->query($sql_delete_quote)) {
                throw new Exception("Error deleting quote: " . $conn->error);
            }
        }
    }
    // Commit the transaction
    if (!$conn->commit()) {
        throw new Exception("Error committing transaction: " . $conn->error);
    }

    $sport = [
        "id" => $id,
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



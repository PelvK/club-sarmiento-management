<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

file_put_contents("./debug_input.log", print_r($input, true));

if (!isset($input['id'])) {
    echo json_encode(["success" => false, "message" => "ID requerido"]);
    exit;
}

$idPayment = $input['id'];
$amount = $input['amount'];

try {
    $stmt = $db->prepare("
        UPDATE Payments
        SET status = 'paid', paid_amount=:amount
        WHERE id = :id
    ");

    $stmt->execute([
        'id' => $idPayment,
        'amount' => $amount
    ]);

    echo json_encode([
        "success" => true,
        "id" => $idPayment
    ]);

} catch (Exception $e) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>

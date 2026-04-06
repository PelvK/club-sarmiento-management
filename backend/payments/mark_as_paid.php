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
$withSurcharge = isset($input['withSurcharge']) ? $input['withSurcharge'] : false;

try {
    $status = $withSurcharge ? 'paid_with_surcharge' : 'paid';

    $stmt = $db->prepare("
        UPDATE Payments
        SET status = :status, paid_amount = :amount, paid_date = NOW()
        WHERE id = :id
    ");

    $stmt->execute([
        'id' => $idPayment,
        'amount' => $amount,
        'status' => $status
    ]);

    echo json_encode([
        "success" => true,
        "id" => $idPayment,
        "status" => $status
    ]);

} catch (Exception $e) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>

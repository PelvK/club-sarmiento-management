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

try {

    // 1️⃣ Obtener estado actual
    $stmt = $db->prepare("SELECT status FROM Payments WHERE id = :id");
    $stmt->execute(['id' => $idPayment]);

    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        echo json_encode([
            "success" => false,
            "message" => "Pago no encontrado"
        ]);
        exit;
    }

    $currentStatus = $payment['status'];

    // 2️⃣ Determinar nuevo estado
    if ($currentStatus === 'pending') {
        $newStatus = 'cancelled';
        $newPaidAmount = 0;
    } elseif ($currentStatus === 'paid') {
        $newStatus = 'pending';
        $newPaidAmount = 0;
    } else {
        $newStatus = $currentStatus;
        $newPaidAmount = 0;
    }

    // 3️⃣ Actualizar
    $updateStmt = $db->prepare("
        UPDATE Payments
        SET status = :status,
            paid_amount = :paid_amount
        WHERE id = :id
    ");

    $updateStmt->execute([
        'status' => $newStatus,
        'paid_amount' => $newPaidAmount,
        'id' => $idPayment
    ]);

    echo json_encode([
        "success" => true,
        "old_status" => $currentStatus,
        "new_status" => $newStatus,
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

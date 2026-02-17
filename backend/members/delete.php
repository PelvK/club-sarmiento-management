<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);
$memberId = $conn->real_escape_string($input['id']);

$conn->begin_transaction();

try {
    // Verificar si es jefe de familia con miembros
    $sqlCheck = "SELECT COUNT(fm.id) as count
                 FROM Family_groups fg
                 JOIN Family_members fm ON fm.family_id = fg.id
                 WHERE fg.head_id = '$memberId'";

    $res = $conn->query($sqlCheck);
    if (!$res) throw new Exception("Error checking family group status");

    $data = $res->fetch_assoc();
    $hasMembers = $data['count'] > 0;

    if ($hasMembers) {
        throw new Exception("No se puede eliminar: el miembro es jefe de familia con integrantes.");
    }

    // Si es jefe sin miembros, se puede borrar el grupo
    $conn->query("DELETE FROM Family_groups WHERE head_id = '$memberId'");
    $conn->query("DELETE FROM Family_members WHERE member_id = '$memberId'");
    $conn->query("UPDATE Members SET deleted = '1' WHERE id = '$memberId'");

    $conn->commit();
    echo json_encode(["success" => true, "id" => $memberId]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();

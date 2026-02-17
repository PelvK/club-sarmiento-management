<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$sql = "SELECT fg.head_id as headId, m.dni as dni, m.name as name, m.second_name as second_name, 
m.birthdate as birthdate, m.active as active, m.phone_number as phone, m.email as email 
FROM Family_groups as fg 
INNER JOIN Members as m ON fg.head_id = m.id WHERE m.deleted='0'";

$result = $conn->query($sql);

$familyHeads = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        $sql1 = "SELECT d.id, d.name, md.principal_sport from Disciplines as d 
        INNER JOIN Members_disciplines as md on md.discipline_id = d.id
        WHERE md.member_id = '" . $row["headId"] . "'";

        $result1 = $conn->query($sql1);

        $sports = [];

        if ($result1->num_rows > 0) {
            while ($row1 = $result1->fetch_assoc()) {

                $sport = [
                    "id" => $row1["id"],
                    "name" => $row1["name"],
                    "isPrincipal" => (bool)$row1["principal_sport"]
                ];

                $sports[] = $sport;
            }
        }

        $familyHead = [
            "id" => $row["headId"],
            "dni" => $row["dni"],
            "name" => $row["name"],
            "second_name" => $row["second_name"],
            "birthdate" => $row["birthdate"],
            "active" => (bool) $row["active"],
            "phone_number" => $row["phone"],
            "email" => $row["email"],
            "sports" => $sports
        ];

        $familyHeads[] = $familyHead;
    }
}

echo json_encode($familyHeads);

$conn->close();

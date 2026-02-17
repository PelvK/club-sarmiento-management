<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$sql = "SELECT * FROM Members WHERE deleted='0'";
$result = $conn->query($sql);

$members = [];

if ($result->num_rows > 0) {

    while ($row = $result->fetch_assoc()) {

        $societary_cuote = null; // Inicializar como null
        
        if (isset($row["societary_cuote"]) && $row["societary_cuote"]) {
            $scuoteId = $row["societary_cuote"];
            $sql_cuote = "SELECT * FROM Quotes WHERE id = '$scuoteId'";
            $result_cuote = $conn->query($sql_cuote);
            
            if ($result_cuote && $result_cuote->num_rows > 0) {
                $row_cuote = $result_cuote->fetch_assoc();
                $societary_cuote = [
                    "id" => $row_cuote["id"],
                    "name" => $row_cuote["name"],
                    "price" => $row_cuote["value"],
                    "description" => $row_cuote["description"],
                ];
            }
        }

        $sql1 = "SELECT d.id, d.name, md.principal_sport, md.quote_id, q.description as qdesc 
                 FROM Disciplines as d 
                 INNER JOIN Members_disciplines as md on md.discipline_id = d.id
                 INNER JOIN Quotes as q on q.id = md.quote_id
                 WHERE md.member_id = '" . $row["id"] . "'";

        $result1 = $conn->query($sql1);

        $sports = [];

        if ($result1->num_rows > 0) {
            while ($row1 = $result1->fetch_assoc()) {

                $sql_cuote = "SELECT * FROM Quotes WHERE id = '" . $row1["quote_id"] . "'";
                $result_cuote = $conn->query($sql_cuote);
                
                $sport_cuote = [];
                
                if ($result_cuote && $result_cuote->num_rows > 0) {
                    $row_cuote = $result_cuote->fetch_assoc();
                    $sport_cuote[] = [
                        "id" => $row_cuote["id"],
                        "name" => $row_cuote["name"],
                        "price" => $row_cuote["value"],
                        "description" => $row_cuote["description"],
                        "duration" => $row_cuote["duration"],
                    ];
                }

                $sport = [
                    "id" => $row1["id"],
                    "name" => $row1["name"],
                    "quotes" => $sport_cuote,
                    "isPrincipal" => (bool)$row1["principal_sport"],
                ];

                $sports[] = $sport;
            }
        }

        // Obtener el family_status directamente de la tabla Members
        $familyGroupStatus = $row["family_status"] ?? "NONE";
        
        // Solo obtener el familyHeadId si es MEMBER
        $familyHeadID = "";
        if ($familyGroupStatus === "MEMBER") {
            $sql_miembro = "SELECT fg.head_id as headID FROM Family_members as fm 
            INNER JOIN Family_groups as fg ON fg.id = fm.family_id 
            WHERE member_id = '" . $row["id"] . "' LIMIT 1";
            
            $result_miembro = $conn->query($sql_miembro);

            if ($result_miembro && $result_miembro->num_rows > 0) {
                $row_miembro = $result_miembro->fetch_assoc();
                $familyHeadID = $row_miembro["headID"];
            }
        }
        
        $member = [
            "id" => $row["id"],
            "dni" => $row["dni"],
            "name" => $row["name"],
            "second_name" => $row["second_name"],
            "birthdate" => $row["birthdate"],
            "active" => (bool)$row["active"],
            "phone_number" => $row["phone_number"],
            "email" => $row["email"],
            "societary_cuote" => $societary_cuote,
            "familyGroupStatus" => $familyGroupStatus,
            "familyHeadId" => $familyHeadID,
            "sports" => $sports
        ];

        $members[] = $member;
    }
}

echo json_encode($members);

$conn->close();
?>
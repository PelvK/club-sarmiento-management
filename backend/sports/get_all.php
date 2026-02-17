<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$sql1 = "SELECT * FROM Disciplines as d";
$result1 = $conn->query($sql1);

$disciplines = [];

if ($result1->num_rows > 0) {
    while ($row1 = $result1->fetch_assoc()) {

        $sql2 = "SELECT q.id, q.description, q.name, q.value, q.duration from Quotes as q 
        INNER JOIN Disciplines as d on d.id = q.discipline_id
        WHERE q.discipline_id = '" . $row1["id"] . "' and q.type = 'deportiva'";
        

        $result2 = $conn->query($sql2);

        $quotes = [];

        if ($result2->num_rows > 0) {
            while ($row2 = $result2->fetch_assoc()) {

                $sql_participants = "SELECT COUNT(*) as participants FROM Members_disciplines WHERE discipline_id = '" . $row1["id"] . "' AND quote_id = '" . $row2["id"] . "'";
                $result_participants = $conn->query($sql_participants);
                $participants = 0;
                if ($result_participants && $result_participants->num_rows > 0) {
                    $row_participants = $result_participants->fetch_assoc();
                    $participants = $row_participants["participants"];
                }

                $quote = [
                    "id" => $row2["id"],
                    "name" => $row2["name"],
                    "description" => $row2["description"],
                    "price" => $row2["value"],
                    "duration" => $row2["duration"],
                    "participants" => $participants
                ];

                $quotes[] = $quote;
            }
        }

        $discipline = [
            "id" => $row1["id"],
            "name" => $row1["name"],
            "description" => $row1["description"],
            "quotes" => $quotes
        ];

        $disciplines[] = $discipline;
    }
}

echo json_encode($disciplines);

$conn->close();

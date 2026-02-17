<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

file_put_contents("./debug_input.log", print_r($input, true));


if (!isset($input['dni'], $input['name'], $input['second_name'], $input['birthdate'])) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$dni = $conn->real_escape_string($input['dni']);
$name = $conn->real_escape_string($input['name']);
$second_name = $conn->real_escape_string($input['second_name']);
$birthdate = $conn->real_escape_string($input['birthdate']);
$phone_number = isset($input['phone_number']) ? $conn->real_escape_string($input['phone_number']) : '';
$email = isset($input['email']) ? $conn->real_escape_string($input['email']) : '';
$active = true;
$sport_submit = isset($input['sports_submit']) ? $input['sports_submit'] : [];
$familyGroupStatus = $conn->real_escape_string($input['familyGroupStatus']);
$familyHeadId = $conn->real_escape_string($input['familyHeadId']);
$societaryCuote = isset($input['societary_cuote']) ? $input['societary_cuote'] : [];

$conn->begin_transaction();

try {
    $scuoteId = $societaryCuote['id'];
    $sql = "INSERT INTO Members (dni, name, second_name, birthdate, phone_number, email, societary_cuote, active, family_status) 
            VALUES ('$dni', '$name', '$second_name', '$birthdate', '$phone_number', '$email', '$scuoteId' ,'$active', '$familyGroupStatus')";

    if (!$conn->query($sql)) {
        throw new Exception("Error inserting member: " . $conn->error);
    }

    $memberId = $conn->insert_id;

    if($familyGroupStatus === "HEAD") {
        $sql1 = "INSERT INTO Family_groups (head_id) VALUES ('$memberId')";

        if (!$conn->query($sql1)) {
            throw new Exception("Error inserting member in family: " . $conn->error);
        }
    }

    if ($familyGroupStatus === "MEMBER") {
        $sqlPrev = "SELECT id FROM Family_groups WHERE head_id = '$familyHeadId'";
        $resPrev = $conn->query($sqlPrev);

    if ($resPrev && $resPrev->num_rows > 0) {
        $row = $resPrev->fetch_assoc();
        $familyId = $row['id'];

        $sql1 = "INSERT INTO Family_members (family_id, member_id) VALUES ('$familyId', '$memberId')";
        if (!$conn->query($sql1)) {
            throw new Exception("Error inserting member in family: " . $conn->error);
        }
    } else {
        throw new Exception("No family group found for head_id: $familyHeadId");
    }
}

    if (is_array($sport_submit)) {
        $sports_get = [];

        foreach ($sport_submit as $sport) {
            $sportId = $conn->real_escape_string($sport['id']);
            $isPrimary = isset($sport['isPrincipal']) && $sport['isPrincipal'] ? 1 : 0;
            $quoteId = $conn->real_escape_string($sport['quoteId']);

            $sql2 = "INSERT INTO Members_disciplines (member_id, discipline_id, principal_sport, quote_id) 
                     VALUES ('$memberId', '$sportId', '$isPrimary', '$quoteId')";

            if (!$conn->query($sql2)) {
                throw new Exception("Error inserting discipline: " . $conn->error);
            }
            
            $sql_sport = "SELECT d.id, d.name, md.principal_sport from Disciplines as d 
                INNER JOIN Members_disciplines as md on md.discipline_id = d.id
                WHERE md.member_id = '" . $memberId. "'";
            
        }

        $sql_sport = "SELECT d.id, d.name, md.principal_sport from Disciplines as d 
                INNER JOIN Members_disciplines as md on md.discipline_id = d.id
                WHERE md.member_id = '" . $memberId. "'";

        $result_sport = $conn->query($sql_sport);

            if (!$result_sport) {
                throw new Exception("Error getting disciplines: " . $conn->error);
            }

            while ($row_sport = $result_sport->fetch_assoc()) {

                $sport_get = [
                    "id" => $row_sport["id"],
                    "name" => $row_sport["name"],
                    "description" => $row_sport["description"],
                    "quotes" => $quotes
                ];
                $sports_get[] = $sport_get;
            }      
    }

    $conn->commit();

    $member = [
        "id" => $memberId,
        "dni" => $dni,
        "name" => $name,
        "second_name" => $second_name,
        "birthdate" => $birthdate,
        "phone_number" => $phone_number,
        "email" => $email,
        "active" => true,
        "familyHeadId" => $familyHeadId,
        "sports" => $sports_get
    ];

    echo json_encode(["success" => true, "member" => $member]);

} catch (Exception $e) {

    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>



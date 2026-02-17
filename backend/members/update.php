<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

file_put_contents("./debug_input.log", print_r($input, true));

$idMember = $conn->real_escape_string($input['id']);
$dni = $conn->real_escape_string($input['dni']);
$name = $conn->real_escape_string($input['name']);
$second_name = $conn->real_escape_string($input['second_name']);
$birthdate = $conn->real_escape_string($input['birthdate']);
$phone_number = isset($input['phone_number']) ? $conn->real_escape_string($input['phone_number']) : '';
$email = isset($input['email']) ? $conn->real_escape_string($input['email']) : '';
$active = true;
$sport_submit = isset($input['sports_submit']) ? $input['sports_submit'] : [];
$familyGroupStatus = $input['familyGroupStatus'] ?? 'NONE';
$familyHeadId = $input['familyHeadId'] ?? '';
$societaryCuote = isset($input['societary_cuote']) ? $input['societary_cuote'] : [];


$conn->begin_transaction();

try {
    $scuoteId = $societaryCuote['id'];
    
    $sql = "UPDATE Members 
            SET dni = '$dni',
                name = '$name',
                second_name = '$second_name',
                birthdate = '$birthdate',
                phone_number = '$phone_number',
                email = '$email',
                societary_cuote = '$scuoteId',
                active = '$active'
            WHERE id = '$idMember'";
    
    if (!$conn->query($sql)) {
        throw new Exception("Error updating member: " . $conn->error);
    }

    /** LOGICA PARA TODO LO QUE TIENE QUE VER CON LAS DISCIPLINAS */
    
    // OBTENER DEPORTES ACTUALES DESDE LA BASE DE DATOS (NO del request)
    $sql_current = "SELECT discipline_id, quote_id, principal_sport 
                    FROM Members_disciplines 
                    WHERE member_id = '$idMember'";
    $result_current = $conn->query($sql_current);
    
    $map_actuales = [];
    if ($result_current && $result_current->num_rows > 0) {
        while ($row = $result_current->fetch_assoc()) {
            $map_actuales[$row['discipline_id']] = [
                'quoteId' => $row['quote_id'],
                'isPrincipal' => (bool)$row['principal_sport']
            ];
        }
    }
    
    $map_nuevos = [];
    foreach ($sport_submit as $sport) {
        $map_nuevos[$sport['id']] = [
            'quoteId' => $sport['quoteId'],
            'isPrincipal' => boolval($sport['isPrincipal'])
        ];
    }

    $to_insert = [];
    $to_update = [];
    $to_delete = [];

    foreach ($map_nuevos as $id => $nuevo) {
        if (!isset($map_actuales[$id])) {
            $to_insert[$id] = $nuevo;
        } else {
            $actual = $map_actuales[$id];
            if ($actual['quoteId'] != $nuevo['quoteId'] || $actual['isPrincipal'] != $nuevo['isPrincipal']) {
                $to_update[$id] = $nuevo;
            }
        }
    }

    foreach ($map_actuales as $id => $actual) {
        if (!isset($map_nuevos[$id])) {
            $to_delete[] = $id;
        }
    }

    foreach ($to_delete as $disciplineId) {
        $disciplineId = $conn->real_escape_string($disciplineId);
        $sql = "DELETE FROM Members_disciplines WHERE member_id = '$idMember' AND discipline_id = '$disciplineId'";
        if (!$conn->query($sql)) {
            throw new Exception("Error deleting discipline: " . $conn->error);
        }
    }

    foreach ($to_insert as $disciplineId => $data) {
        $disciplineId = $conn->real_escape_string($disciplineId);
        $quoteId = $conn->real_escape_string($data['quoteId']);
        $isPrincipal = $data['isPrincipal'] ? 1 : 0;

        $sql = "INSERT INTO Members_disciplines (member_id, discipline_id, quote_id, principal_sport)
            VALUES ('$idMember', '$disciplineId', '$quoteId', '$isPrincipal')";

        if (!$conn->query($sql)) {
            throw new Exception("Error inserting discipline: " . $conn->error);
        }
    }
    
    foreach ($to_update as $disciplineId => $data) {
        $disciplineId = $conn->real_escape_string($disciplineId);
        $quoteId = $conn->real_escape_string($data['quoteId']);
        $isPrincipal = $data['isPrincipal'] ? 1 : 0;

        $sql = "UPDATE Members_disciplines 
            SET quote_id = '$quoteId', principal_sport = '$isPrincipal'
            WHERE member_id = '$idMember' AND discipline_id = '$disciplineId'";

        if (!$conn->query($sql)) {
            throw new Exception("Error updating discipline: " . $conn->error);
        }
    }

    /** LOGICA PARA TODO LO QUE TIENE QUE VER CON LOS MIEMBROS */

    $sqlStatus = "SELECT family_status FROM Members WHERE id = '$idMember'";
    $resStatus = $conn->query($sqlStatus);
    if (!$resStatus || $resStatus->num_rows === 0) {
        throw new Exception("No se encontró el miembro con ID $idMember");
    }
    $rowStatus = $resStatus->fetch_assoc();
    $previousStatus = $rowStatus['family_status'];
    $newStatus = $conn->real_escape_string($familyGroupStatus);

    if ($previousStatus !== $newStatus) {
        
        // HEAD → NONE o MEMBER
        if ($previousStatus === "HEAD") {
            // Obtener el ID del grupo familiar
            $sqlGetGroup = "SELECT id FROM Family_groups WHERE head_id = '$idMember' LIMIT 1";
            $resGetGroup = $conn->query($sqlGetGroup);
            
            if ($resGetGroup && $resGetGroup->num_rows > 0) {
                $rowGroup = $resGetGroup->fetch_assoc();
                $familyGroupId = $rowGroup['id'];
                
                // Obtener todos los miembros del grupo familiar
                $sqlGetMembers = "SELECT member_id FROM Family_members WHERE family_id = '$familyGroupId'";
                $resGetMembers = $conn->query($sqlGetMembers);
                
                $childrenIds = [];
                if ($resGetMembers && $resGetMembers->num_rows > 0) {
                    while ($rowMember = $resGetMembers->fetch_assoc()) {
                        $childrenIds[] = $rowMember['member_id'];
                    }
                }
                
                // 1. Actualizar todos los hijos a NONE
                if (!empty($childrenIds)) {
                    $childrenIdsStr = implode(',', array_map(function($id) use ($conn) {
                        return "'" . $conn->real_escape_string($id) . "'";
                    }, $childrenIds));
                    
                    $sqlUpdateChildren = "UPDATE Members SET family_status = 'NONE' WHERE id IN ($childrenIdsStr)";
                    if (!$conn->query($sqlUpdateChildren)) {
                        throw new Exception("Error updating children to NONE: " . $conn->error);
                    }
                }
                
                // 2. Eliminar todas las relaciones de Family_members
                $sqlDeleteMembers = "DELETE FROM Family_members WHERE family_id = '$familyGroupId'";
                if (!$conn->query($sqlDeleteMembers)) {
                    throw new Exception("Error deleting family members: " . $conn->error);
                }
                
                // 3. Eliminar el grupo familiar
                $sqlDeleteGroup = "DELETE FROM Family_groups WHERE id = '$familyGroupId'";
                if (!$conn->query($sqlDeleteGroup)) {
                    throw new Exception("Error deleting family group: " . $conn->error);
                }
            }
        }

        // MEMBER → HEAD
        if ($newStatus === "HEAD") {
            // Eliminar la relación de miembro si existía
            $conn->query("DELETE FROM Family_members WHERE member_id = '$idMember'");
            
            // Crear nuevo grupo familiar
            $sqlInsertGroup = "INSERT INTO Family_groups (head_id) VALUES ('$idMember')";
            if (!$conn->query($sqlInsertGroup)) {
                throw new Exception("Error creating family group: " . $conn->error);
            }
        }

        // NONE → MEMBER (o HEAD → MEMBER después de limpiar)
        if ($newStatus === "MEMBER") {
            if (empty($familyHeadId)) {
                throw new Exception("Se requiere un jefe de familia para establecer el estado como MEMBER");
            }
            
            // Verificar que el jefe existe y es HEAD
            $sqlCheckHead = "SELECT family_status FROM Members WHERE id = '$familyHeadId'";
            $resCheckHead = $conn->query($sqlCheckHead);
            if (!$resCheckHead || $resCheckHead->num_rows === 0) {
                throw new Exception("No se encontró el jefe de familia con ID: $familyHeadId");
            }
            $rowCheckHead = $resCheckHead->fetch_assoc();
            if ($rowCheckHead['family_status'] !== 'HEAD') {
                throw new Exception("El miembro seleccionado no es un jefe de familia");
            }

            // Obtener el ID del grupo familiar del jefe
            $sqlGetFamilyGroup = "SELECT id FROM Family_groups WHERE head_id = '$familyHeadId' LIMIT 1";
            $resGetFamilyGroup = $conn->query($sqlGetFamilyGroup);
            
            if ($resGetFamilyGroup && $resGetFamilyGroup->num_rows > 0) {
                $rowFamilyGroup = $resGetFamilyGroup->fetch_assoc();
                $familyId = $rowFamilyGroup['id'];

                // Insertar en Family_members
                $sqlInsertMember = "INSERT INTO Family_members (family_id, member_id) VALUES ('$familyId', '$idMember')";
                if (!$conn->query($sqlInsertMember)) {
                    throw new Exception("Error inserting family member: " . $conn->error);
                }
            } else {
                throw new Exception("No se encontró el grupo familiar para el jefe con ID: $familyHeadId");
            }
        }
        
        // MEMBER → NONE
        if ($newStatus === "NONE" && $previousStatus === "MEMBER") {
            // Eliminar la relación de Family_members
            $sqlDeleteMember = "DELETE FROM Family_members WHERE member_id = '$idMember'";
            if (!$conn->query($sqlDeleteMember)) {
                throw new Exception("Error deleting family member relation: " . $conn->error);
            }
        }

        // Finalmente, actualizamos el nuevo estado en Members
        $sqlUpdateStatus = "UPDATE Members SET family_status = '$newStatus' WHERE id = '$idMember'";
        if (!$conn->query($sqlUpdateStatus)) {
            throw new Exception("Error updating family status: " . $conn->error);
        }
    }

    // CORREGIDO: Query completa para obtener deportes CON información de cuotas
    $sql_sport = "SELECT d.id, d.name, d.description, md.principal_sport, md.quote_id,
                         q.name as quote_name, q.value as quote_price, 
                         q.description as quote_description, q.duration as quote_duration
        FROM Disciplines AS d 
        INNER JOIN Members_disciplines AS md ON md.discipline_id = d.id 
        INNER JOIN Quotes AS q ON q.id = md.quote_id
        WHERE md.member_id = '$idMember'";

    $result_sport = $conn->query($sql_sport);

    if (!$result_sport) {
        throw new Exception("Error getting disciplines: " . $conn->error);
    }

    $sports_get = [];

    while ($row_sport = $result_sport->fetch_assoc()) {
        $sport_get = [
            "id" => $row_sport["id"],
            "name" => $row_sport["name"],
            "description" => $row_sport["description"],
            "isPrincipal" => (bool)$row_sport["principal_sport"],
            "quotes" => [
                [
                    "id" => $row_sport["quote_id"],
                    "name" => $row_sport["quote_name"],
                    "price" => $row_sport["quote_price"],
                    "description" => $row_sport["quote_description"],
                    "duration" => $row_sport["quote_duration"]
                ]
            ]
        ];

        $sports_get[] = $sport_get;
    }      

    $conn->commit();

    $member = [
        "id" => $idMember,
        "dni" => $dni,
        "name" => $name,
        "second_name" => $second_name,
        "birthdate" => $birthdate,
        "phone_number" => $phone_number,
        "email" => $email,
        "active" => (bool)$active,
        "societary_cuote" => $societaryCuote,
        "familyHeadId" => $familyHeadId,
        "familyGroupStatus" => $newStatus,
        "sports" => $sports_get
    ];

    echo json_encode(["success" => true, "member" => $member]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
<?php
/**
 * PaymentGenerator
 * 
 * Clase que maneja la lógica completa de generación de cuotas
 * con soporte para grupos familiares y snapshots de precios
 */

class PaymentGenerator {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Genera cuotas basándose en la configuración proporcionada
     * 
     * @param array $config Configuración de generación
     * @return array ['generation' => ..., 'payments' => ...]
     */
    public function generatePayments($config) {
        // Iniciar transacción
        $this->db->beginTransaction();
        
        try {
            // 1. Validar que no exista generación duplicada
            // $this->validateNoExistingGeneration($config['month'], $config['year']);
            
            // 2. Obtener miembros filtrados
            $members = $this->getFilteredMembers($config);
            
            // 3. Calcular preview de datos (como en el frontend)
            $previewData = $this->calculatePreviewData($members, $config);
            
            // 4. Crear registro de generación
            $generationId = $this->createGeneration($config, $previewData);
            
            // 5. Crear cuotas individuales
            $payments = $this->createPayments($generationId, $previewData['breakdown'], $config);
            
            // Commit transacción
            $this->db->commit();
            
            // 6. Retornar resultado
            return [
                'generation' => $this->getGenerationById($generationId),
                'payments' => $payments
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * Valida que no exista una generación activa para el período
     */
    private function validateNoExistingGeneration($month, $year) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM Payment_generations 
            WHERE month = ? AND year = ? AND status = 'active'
        ");
        $stmt->execute([$month, $year]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            throw new Exception("Ya existe una generación activa para $month/$year");
        }
    }
    
    /**
     * Obtiene miembros filtrados según la configuración
     */
    private function getFilteredMembers($config) {
        // Base query
        $sql = "
            SELECT 
                m.*,
                m.family_status as familyGroupStatus,
                q.value as societary_cuote_price,
                q.id as societary_cuote_id
            FROM Members m
            LEFT JOIN Quotes q ON m.societary_cuote = q.id
            WHERE 1
        ";
        
        $params = [];
        
        // Filtro por miembros específicos
        if (!empty($config['selectedMembers'])) {
            $placeholders = str_repeat('?,', count($config['selectedMembers']) - 1) . '?';
            $sql .= " AND m.id IN ($placeholders)";
            $params = array_merge($params, $config['selectedMembers']);
        }
        
        // Filtro por deportes
        if (!empty($config['selectedSports'])) {
            $placeholders = str_repeat('?,', count($config['selectedSports']) - 1) . '?';
            $sql .= " AND EXISTS (
                SELECT 1 FROM Members_disciplines md 
                WHERE md.member_id = m.id 
                AND md.discipline_id IN ($placeholders)
                AND md.status = 'active'
            )";
            $params = array_merge($params, $config['selectedSports']);
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Cargar deportes de cada miembro
        foreach ($members as &$member) {
            $member['sports'] = $this->getMemberSports($member['id'], $config);
            
            // Cargar head_id si es miembro de familia
            if ($member['familyGroupStatus'] === 'MEMBER') {
                $member['familyHeadId'] = $this->getFamilyHeadId($member['id']);
            }
        }
        
        return $members;
    }
    
    /**
     * Obtiene los deportes de un miembro
     */
    private function getMemberSports($memberId, $config) {
        $sql = "
            SELECT 
                d.id,
                d.name,
                d.description,
                md.principal_sport as isPrincipal,
                md.quote_id,
                q.value as quote_price
            FROM Members_disciplines md
            JOIN Disciplines d ON md.discipline_id = d.id
            JOIN Quotes q ON md.quote_id = q.id
            WHERE md.member_id = ? 
            AND md.status = 'active'
        ";
        
        $params = [$memberId];
        
        // Filtrar por deportes seleccionados
        if (!empty($config['selectedSports'])) {
            $placeholders = str_repeat('?,', count($config['selectedSports']) - 1) . '?';
            $sql .= " AND d.id IN ($placeholders)";
            $params = array_merge($params, $config['selectedSports']);
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $sports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convertir isPrincipal a booleano
        foreach ($sports as &$sport) {
            $sport['isPrincipal'] = (bool)$sport['isPrincipal'];
        }
        
        return $sports;
    }
    
    /**
     * Obtiene el ID del head de familia de un miembro
     */
    private function getFamilyHeadId($memberId) {
        $stmt = $this->db->prepare("
            SELECT fg.head_id 
            FROM Family_members fm
            JOIN Family_groups fg ON fm.family_id = fg.id
            WHERE fm.member_id = ?
        ");
        $stmt->execute([$memberId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['head_id'] : null;
    }
    
    /**
     * Calcula preview de datos (misma lógica que usePaymentCalculation)
     */
    private function calculatePreviewData($members, $config) {
        if ($sport['isPrincipal']) {
    $breakdownItems = []; // ← NUEVO: array de items detallados
    $totalAmount = 0;
    
    // Si es HEAD, incluir dependientes
    if ($member['familyGroupStatus'] === 'HEAD') {
        $dependents = $this->getDependents($member['id'], $members);
        
        // ITEM 1: Cuota deportiva del HEAD
        $headSportAmount = $this->getSportAmount($member['id'], $sport['id'], $sport['quote_price'], $config);
        $breakdownItems[] = [
            'type' => 'sport',
            'memberId' => $member['id'],
            'memberName' => $member['name'] . ' ' . $member['second_name'],
            'concept' => $sport['name'],
            'amount' => $headSportAmount
        ];
        $totalAmount += $headSportAmount;
        
        // ITEM 2: Cuota societaria del HEAD (si aplica)
        if ($config['includeSocietary'] && $member['societary_cuote_price']) {
            $headSocietaryAmount = floatval($member['societary_cuote_price']);
            $breakdownItems[] = [
                'type' => 'societary',
                'memberId' => $member['id'],
                'memberName' => $member['name'] . ' ' . $member['second_name'],
                'concept' => 'Cuota Societaria',
                'amount' => $headSocietaryAmount
            ];
            $totalAmount += $headSocietaryAmount;
        }
        
        // ITEMS 3+: Dependientes
        foreach ($dependents as $dep) {
            $depSport = $this->findSport($dep['sports'], $sport['id']);
            
            if ($depSport) {
                // Cuota deportiva del dependiente
                $depSportAmount = $this->getSportAmount($dep['id'], $sport['id'], $depSport['quote_price'], $config);
                $breakdownItems[] = [
                    'type' => 'sport',
                    'memberId' => $dep['id'],
                    'memberName' => $dep['name'] . ' ' . $dep['second_name'],
                    'concept' => $sport['name'],
                    'amount' => $depSportAmount
                ];
                $totalAmount += $depSportAmount;
                
                // Cuota societaria del dependiente (si aplica)
                if ($config['includeSocietary'] && $dep['societary_cuote_price']) {
                    $depSocietaryAmount = floatval($dep['societary_cuote_price']);
                    $breakdownItems[] = [
                        'type' => 'societary',
                        'memberId' => $dep['id'],
                        'memberName' => $dep['name'] . ' ' . $dep['second_name'],
                        'concept' => 'Cuota Societaria',
                        'amount' => $depSocietaryAmount
                    ];
                    $totalAmount += $depSocietaryAmount;
                }
                
                $processedMemberSports[] = $dep['id'] . '-' . $sport['id'];
            }
        }
        
        // Generar descripción resumida
        $totalPeople = 1 + count(array_filter($dependents, function($d) use ($sport) {
            return $this->findSport($d['sports'], $sport['id']) !== null;
        }));
        $description = "{$sport['name']} ({$totalPeople} " . ($totalPeople > 1 ? "personas" : "persona") . ")";
        
        $memberPayments[] = [
            'type' => 'principal-sport',
            'sportId' => $sport['id'],
            'sportName' => $sport['name'],
            'amount' => $totalAmount,
            'description' => $description,
            'breakdown' => [
                'items' => $breakdownItems,
                'total' => $totalAmount
            ]
        ];
        
    } else {
        // NO es HEAD (socio individual)
        $breakdownItems = [];
        $totalAmount = 0;
        
        // ITEM 1: Cuota deportiva
        $sportAmount = $this->getSportAmount($member['id'], $sport['id'], $sport['quote_price'], $config);
        $breakdownItems[] = [
            'type' => 'sport',
            'memberId' => $member['id'],
            'memberName' => $member['name'] . ' ' . $member['second_name'],
            'concept' => $sport['name'],
            'amount' => $sportAmount
        ];
        $totalAmount += $sportAmount;
        
        // ITEM 2: Cuota societaria (si aplica)
        if ($config['includeSocietary'] && $member['societary_cuote_price']) {
            $societaryAmount = floatval($member['societary_cuote_price']);
            $breakdownItems[] = [
                'type' => 'societary',
                'memberId' => $member['id'],
                'memberName' => $member['name'] . ' ' . $member['second_name'],
                'concept' => 'Cuota Societaria',
                'amount' => $societaryAmount
            ];
            $totalAmount += $societaryAmount;
        }
        
        $memberPayments[] = [
            'type' => 'principal-sport',
            'sportId' => $sport['id'],
            'sportName' => $sport['name'],
            'amount' => $totalAmount,
            'description' => $sport['name'],
            'breakdown' => [
                'items' => $breakdownItems,
                'total' => $totalAmount
            ]
        ];
    }
}
    }
    
    /**
     * Helpers
     */
    private function getSportAmount($memberId, $sportId, $defaultPrice, $config) {
        $key = "$memberId-$sportId";
        return isset($config['customAmounts'][$key]) 
            ? floatval($config['customAmounts'][$key]) 
            : floatval($defaultPrice);
    }
    
    private function getDependents($headId, $members) {
        return array_filter($members, function($m) use ($headId) {
            return $m['familyGroupStatus'] === 'MEMBER' && 
                   isset($m['familyHeadId']) && 
                   $m['familyHeadId'] == $headId;
        });
    }
    
    private function findSport($sports, $sportId) {
        foreach ($sports as $sport) {
            if ($sport['id'] == $sportId) {
                return $sport;
            }
        }
        return null;
    }
    
    /**
     * Crea el registro de generación
     */
    private function createGeneration($config, $previewData) {
        $generationId = "gen-{$config['year']}-" . 
                    str_pad($config['month'], 2, '0', STR_PAD_LEFT) . 
                    "-" . time();
        
        $stmt = $this->db->prepare("
            INSERT INTO Payment_generations (
                id, month, year, generated_by, status, notes,
                total_payments, total_amount,
                only_societary_count, only_societary_amount,
                principal_sports_count, principal_sports_amount,
                secondary_sports_count, secondary_sports_amount,
                config_snapshot
            ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $generationId,
            $config['month'],
            $config['year'],
            $_SESSION['user_id'] ?? null,
            $config['notes'] ?? null,
            $previewData['totalPayments'],
            $previewData['totalAmount'],
            $previewData['stats']['onlySocietaryCount'],
            $previewData['stats']['onlySocietaryAmount'],
            $previewData['stats']['principalSportsCount'],
            $previewData['stats']['principalSportsAmount'],
            $previewData['stats']['secondarySportsCount'],
            $previewData['stats']['secondarySportsAmount'],
            json_encode($config)
        ]);
        
        return $generationId;
    }
    
    /**
     * Crea las cuotas individuales
     */
    private function createPayments($generationId, $breakdown, $config) {
        $payments = [];
        $dueDate = "{$config['year']}-" . str_pad($config['month'], 2, '0', STR_PAD_LEFT) . "-10";
        
        foreach ($breakdown as $item) {
            $member = $item['member'];
            
            foreach ($item['payments'] as $payment) {
                // Insertar payment
                $stmt = $this->db->prepare("
                    INSERT INTO Payments (
                        generation_id, member_id, month, year, due_date,
                        type, sport_id, amount, description, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                ");
                
                $stmt->execute([
                    $generationId,
                    $member['id'],
                    $config['month'],
                    $config['year'],
                    $dueDate,
                    $payment['type'],
                    $payment['sportId'] ?? null,
                    $payment['amount'],
                    $payment['description']
                ]);
                
                $paymentId = $this->db->lastInsertId();
                
                // Si tiene breakdown, insertar detalles
                if (isset($payment['breakdown'])) {
                    $this->createPaymentBreakdown($paymentId, $member, $payment['breakdown']);
                }
                
                $payments[] = [
                    'id' => $paymentId,
                    'generationId' => $generationId,
                    'memberId' => $member['id'],
                    'amount' => $payment['amount'],
                    'description' => $payment['description'],
                    'type' => $payment['type']
                ];
            }
        }
        
        return $payments;
    }
    
    /**
     * Crea los registros de breakdown
     */
    private function createPaymentBreakdown($paymentId, $member, $breakdown) {
        // Insertar HEAD
        $stmt = $this->db->prepare("
            INSERT INTO Payment_breakdowns (
                payment_id, member_id, member_role,
                societary_amount, sport_amount,
                member_name_snapshot, sport_name_snapshot
            ) VALUES (?, ?, 'head', ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $paymentId,
            $member['id'],
            $breakdown['headSocietary'],
            $breakdown['headSport'],
            $member['name'] . ' ' . $member['second_name'],
            null // sport name se puede agregar si es necesario
        ]);
        
        // Insertar dependientes
        foreach ($breakdown['dependents'] as $dep) {
            $stmt->execute([
                $paymentId,
                $dep['memberId'],
                $dep['societaryAmount'],
                $dep['sportAmount'],
                $dep['memberName'],
                null
            ]);
        }
    }
    
    /**
     * Obtiene una generación por ID
     */
/**
 * Obtiene una generación por ID formateada para el frontend
 */
private function getGenerationById($generationId) {
    $stmt = $this->db->prepare("
        SELECT * FROM Payment_generations WHERE id = ?
    ");
    $stmt->execute([$generationId]);
    $gen = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$gen) {
        return null;
    }
    
    // Formatear para TypeScript (camelCase)
    return [
        'id' => $gen['id'],
        'month' => (int)$gen['month'],
        'year' => (int)$gen['year'],
        'generatedDate' => $gen['generated_date'],
        'generatedBy' => $gen['generated_by'],
        'status' => $gen['status'],
        'revertedDate' => $gen['reverted_date'],
        'revertedBy' => $gen['reverted_by'],
        'notes' => $gen['notes'],
        'totalPayments' => (int)$gen['total_payments'],
        'totalAmount' => (float)$gen['total_amount'],
        'stats' => [
            'onlySocietaryCount' => (int)$gen['only_societary_count'],
            'onlySocietaryAmount' => (float)$gen['only_societary_amount'],
            'principalSportsCount' => (int)$gen['principal_sports_count'],
            'principalSportsAmount' => (float)$gen['principal_sports_amount'],
            'secondarySportsCount' => (int)$gen['secondary_sports_count'],
            'secondarySportsAmount' => (float)$gen['secondary_sports_amount'],
        ],
        'configSnapshot' => $gen['config_snapshot'] ? json_decode($gen['config_snapshot'], true) : null
    ];
}
    
    /**
     * Revierte una generación (soft delete)
     */
    public function revertGeneration($generationId) {
        $this->db->beginTransaction();
        
        try {
            // Marcar generación como revertida
            $stmt = $this->db->prepare("
                UPDATE Payment_generations 
                SET status = 'reverted', 
                    reverted_date = NOW(),
                    reverted_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$_SESSION['user_id'] ?? null, $generationId]);
            
            // Marcar cuotas como canceladas
            $stmt = $this->db->prepare("
                UPDATE Payments 
                SET status = 'cancelled'
                WHERE generation_id = ?
            ");
            $stmt->execute([$generationId]);
            
            $this->db->commit();
            
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
}
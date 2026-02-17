<?php
/**
 * PaymentGenerator - Versión actualizada
 * 
 * Genera cuotas con estructura de breakdown por items individuales
 */

class PaymentGenerator {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
public function generatePayments($config) {
    $this->db->beginTransaction();
    
    try {

        
        $members = $this->getFilteredMembers($config);
        
        $previewData = $this->calculatePreviewData($members, $config);
        
        $generationId = $this->createGeneration($config, $previewData);
        $payments = $this->createPayments($generationId, $previewData['breakdown'], $config);
        
        $this->db->commit();
        
        return [
            'generation' => $this->getGenerationById($generationId),
            'payments' => $payments
        ];
        
    } catch (Exception $e) {
        $this->db->rollback();
        throw $e;
    }
}
    
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
    
    private function getFilteredMembers($config) {
        $sql = "
            SELECT 
                m.*,
                m.family_status as familyGroupStatus,
                qs.value as societary_cuote_price,
                qs.id as societary_cuote_id,
                qs.name as societary_cuote_name
            FROM Members m
            LEFT JOIN Quotes qs ON m.societary_cuote = qs.id
            WHERE m.active = 1
        ";
        
        $params = [];
        
        if (!empty($config['selectedMembers'])) {
            $placeholders = str_repeat('?,', count($config['selectedMembers']) - 1) . '?';
            $sql .= " AND m.id IN ($placeholders)";
            $params = array_merge($params, $config['selectedMembers']);
        }
        
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
        
        foreach ($members as &$member) {
            $member['sports'] = $this->getMemberSports($member['id'], $config);
            
            if ($member['familyGroupStatus'] === 'MEMBER') {
                $member['familyHeadId'] = $this->getFamilyHeadId($member['id']);
            }
        }
        
        return $members;
    }
    
    private function getMemberSports($memberId, $config) {
        $sql = "
            SELECT 
                d.id,
                d.name,
                d.description,
                md.principal_sport as isPrincipal,
                md.quote_id,
                q.value as quote_price,
                q.name as quote_name
            FROM Members_disciplines md
            JOIN Disciplines d ON md.discipline_id = d.id
            JOIN Quotes q ON md.quote_id = q.id
            WHERE md.member_id = ? 
            AND md.status = 'active'
        ";
        
        $params = [$memberId];
        
        if (!empty($config['selectedSports'])) {
            $placeholders = str_repeat('?,', count($config['selectedSports']) - 1) . '?';
            $sql .= " AND d.id IN ($placeholders)";
            $params = array_merge($params, $config['selectedSports']);
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $sports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($sports as &$sport) {
            $sport['isPrincipal'] = (bool)$sport['isPrincipal'];
        }
        
        return $sports;
    }
    
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
     * Calcula preview con NUEVA estructura de breakdown por items
     */
    private function calculatePreviewData($members, $config) {
        $processedMemberSports = [];
        
        $stats = [
            'onlySocietaryCount' => 0,
            'onlySocietaryAmount' => 0,
            'principalSportsCount' => 0,
            'principalSportsAmount' => 0,
            'secondarySportsCount' => 0,
            'secondarySportsAmount' => 0
        ];
        
        $breakdown = [];
        
        // Procesar HEADs y NONEs
        foreach ($members as $member) {
            if ($member['familyGroupStatus'] === 'MEMBER') {
                continue;
            }
            
            $memberPayments = [];
            $memberSports = $member['sports'];
            
            // CASO 1: Sin disciplinas (solo societaria)
            if (empty($memberSports)) {
                if ($config['includeSocietary'] && $member['societary_cuote_price']) {
                    $amount = floatval($member['societary_cuote_price']);
                    
                    $breakdownItems = [[
                        'type' => 'societary',
                        'memberId' => $member['id'],
                        'memberName' => $member['name'] . ' ' . $member['second_name'],
                        'concept' => 'Cuota Societaria',
                        'description' => $member['societary_cuote_name'] ?: '',
                        'amount' => $amount
                    ]];
                    
                    $memberPayments[] = [
                        'type' => 'societary-only',
                        'amount' => $amount,
                        'description' => 'Cuota Societaria',
                        'breakdownItems' => $breakdownItems
                    ];
                    
                    $stats['onlySocietaryCount']++;
                    $stats['onlySocietaryAmount'] += $amount;
                }
            }
            // CASO 2: Con disciplinas
            else {
                foreach ($memberSports as $sport) {
                    $key = $member['id'] . '-' . $sport['id'];
                    
                    if (in_array($key, $processedMemberSports)) {
                        continue;
                    }
                    
                    $sportAmount = $this->getSportAmount($member['id'], $sport['id'], $sport['quote_price'], $config);
                    
                    // DISCIPLINA PRINCIPAL
                    if ($sport['isPrincipal']) {
                        $totalAmount = 0;
                        $description = $sport['name'];
                        $breakdownItems = [];
                        
                        // Si es HEAD, incluir dependientes
                        if ($member['familyGroupStatus'] === 'HEAD') {
                            $dependents = $this->getDependents($member['id'], $members);
                            
                            // Item societaria del HEAD
                            if ($config['includeSocietary'] && $member['societary_cuote_price']) {
                                $societaryAmount = floatval($member['societary_cuote_price']);
                                $breakdownItems[] = [
                                    'type' => 'societary',
                                    'memberId' => $member['id'],
                                    'memberName' => $member['name'] . ' ' . $member['second_name'],
                                    'concept' => 'Cuota Societaria',
                                    'description' => $member['societary_cuote_name'] ?: '',
                                    'amount' => $societaryAmount
                                ];
                                $totalAmount += $societaryAmount;
                            }
                            
                            // Item deportivo del HEAD
                            $breakdownItems[] = [
                                'type' => 'principal-sport',
                                'memberId' => $member['id'],
                                'memberName' => $member['name'] . ' ' . $member['second_name'],
                                'concept' => 'Cuota Deportiva',
                                'description' => $sport['quote_name'] ?: $sport['name'],
                                'amount' => floatval($sportAmount)
                            ];
                            $totalAmount += floatval($sportAmount);
                            
                            // Items de dependientes
                            foreach ($dependents as $dep) {
                                $depSport = $this->findSport($dep['sports'], $sport['id']);
                                
                                if ($depSport) {
                                    $depSportAmount = $this->getSportAmount($dep['id'], $sport['id'], $depSport['quote_price'], $config);
                                    
                                    // Item societaria del dependiente
                                    if ($config['includeSocietary'] && $dep['societary_cuote_price']) {
                                        $depSocietaryAmount = floatval($dep['societary_cuote_price']);
                                        $breakdownItems[] = [
                                            'type' => 'societary',
                                            'memberId' => $dep['id'],
                                            'memberName' => $dep['name'] . ' ' . $dep['second_name'],
                                            'concept' => 'Cuota Societaria',
                                            'description' => $dep['societary_cuote_name'] ?: '',
                                            'amount' => $depSocietaryAmount
                                        ];
                                        $totalAmount += $depSocietaryAmount;
                                    }
                                    
                                    // Item deportivo del dependiente
                                    $breakdownItems[] = [
                                        'type' => 'principal-sport',
                                        'memberId' => $dep['id'],
                                        'memberName' => $dep['name'] . ' ' . $dep['second_name'],
                                        'concept' => 'Cuota Deportiva',
                                        'description' => $depSport['quote_name'] ?: $sport['name'],
                                        'amount' => floatval($depSportAmount)
                                    ];
                                    $totalAmount += floatval($depSportAmount);
                                    
                                    $processedMemberSports[] = $dep['id'] . '-' . $sport['id'];
                                }
                            }
                            
                            // Generar descripción
                            $societariesCount = count(array_filter($breakdownItems, function($item) {
                                return $item['type'] === 'societary';
                            }));
                            
                            if (!empty($dependents)) {
                                $depCount = count(array_filter($dependents, function($dep) use ($sport) {
                                    return $this->findSport($dep['sports'], $sport['id']) !== null;
                                }));
                                $depText = $depCount > 1 ? "$depCount dependientes" : "1 dependiente";
                                $socText = $societariesCount > 0 ? " + $societariesCount societaria" . ($societariesCount > 1 ? 's' : '') : '';
                                $description = "{$sport['name']} (Principal + $depText$socText)";
                            } else {
                                $description = $societariesCount > 0 
                                    ? "{$sport['name']} (Principal + $societariesCount societaria" . ($societariesCount > 1 ? 's' : '') . ")"
                                    : "{$sport['name']} (Principal)";
                            }
                            
                            $memberPayments[] = [
                                'type' => 'principal-sport',
                                'sportId' => $sport['id'],
                                'sportName' => $sport['name'],
                                'amount' => $totalAmount,
                                'description' => $description,
                                'breakdownItems' => $breakdownItems
                            ];
                            
                            $stats['principalSportsCount']++;
                            $stats['principalSportsAmount'] += $totalAmount;
                        }
                        // Si NO es HEAD (es NONE)
                        else {
                            // Item societaria
                            if ($config['includeSocietary'] && $member['societary_cuote_price']) {
                                $societaryAmount = floatval($member['societary_cuote_price']);
                                $breakdownItems[] = [
                                    'type' => 'societary',
                                    'memberId' => $member['id'],
                                    'memberName' => $member['name'] . ' ' . $member['second_name'],
                                    'concept' => 'Cuota Societaria',
                                    'description' => $member['societary_cuote_name'] ?: '',
                                    'amount' => $societaryAmount
                                ];
                                $totalAmount += $societaryAmount;
                                $description .= ' (Principal + Societaria)';
                            } else {
                                $description .= ' (Principal)';
                            }
                            
                            // Item deportivo
                            $breakdownItems[] = [
                                'type' => 'principal-sport',
                                'memberId' => $member['id'],
                                'memberName' => $member['name'] . ' ' . $member['second_name'],
                                'concept' => 'Cuota Deportiva',
                                'description' => $sport['quote_name'] ?: $sport['name'],
                                'amount' => floatval($sportAmount)
                            ];
                            $totalAmount += floatval($sportAmount);
                            
                            $memberPayments[] = [
                                'type' => 'principal-sport',
                                'sportId' => $sport['id'],
                                'sportName' => $sport['name'],
                                'amount' => $totalAmount,
                                'description' => $description,
                                'breakdownItems' => $breakdownItems
                            ];
                            
                            $stats['principalSportsCount']++;
                            $stats['principalSportsAmount'] += $totalAmount;
                        }
                    }
                    // DISCIPLINA SECUNDARIA
                    else if ($config['includeNonPrincipalSports']) {
                        $breakdownItems = [[
                            'type' => 'secondary-sport',
                            'memberId' => $member['id'],
                            'memberName' => $member['name'] . ' ' . $member['second_name'],
                            'concept' => 'Cuota Deportiva',
                            'description' => $sport['quote_name'] ?: $sport['name'],
                            'amount' => floatval($sportAmount)
                        ]];
                        
                        $memberPayments[] = [
                            'type' => 'secondary-sport',
                            'sportId' => $sport['id'],
                            'sportName' => $sport['name'],
                            'amount' => floatval($sportAmount),
                            'description' => $sport['name'],
                            'breakdownItems' => $breakdownItems
                        ];
                        
                        $stats['secondarySportsCount']++;
                        $stats['secondarySportsAmount'] += floatval($sportAmount);
                    }
                    
                    $processedMemberSports[] = $key;
                }
            }
            
            if (!empty($memberPayments)) {
                $breakdown[] = [
                    'member' => $member,
                    'payments' => $memberPayments,
                    'totalAmount' => array_sum(array_column($memberPayments, 'amount'))
                ];
            }
        }
        
        // Procesar MEMBERs con disciplinas adicionales
        foreach ($members as $member) {
            if ($member['familyGroupStatus'] !== 'MEMBER') {
                continue;
            }
            
            $memberPayments = [];
            
            foreach ($member['sports'] as $sport) {
                $key = $member['id'] . '-' . $sport['id'];
                
                if (in_array($key, $processedMemberSports)) {
                    continue;
                }
                
                $sportAmount = $this->getSportAmount($member['id'], $sport['id'], $sport['quote_price'], $config);
                
                $breakdownItems = [[
                    'type' => 'secondary-sport',
                    'memberId' => $member['id'],
                    'memberName' => $member['name'] . ' ' . $member['second_name'],
                    'concept' => 'Cuota Deportiva',
                    'description' => $sport['quote_name'] ?: $sport['name'],
                    'amount' => floatval($sportAmount)
                ]];
                
                $memberPayments[] = [
                    'type' => 'secondary-sport',
                    'sportId' => $sport['id'],
                    'sportName' => $sport['name'],
                    'amount' => floatval($sportAmount),
                    'description' => $sport['name'],
                    'breakdownItems' => $breakdownItems
                ];
                
                $stats['secondarySportsCount']++;
                $stats['secondarySportsAmount'] += floatval($sportAmount);
                
                $processedMemberSports[] = $key;
            }
            
            if (!empty($memberPayments)) {
                $breakdown[] = [
                    'member' => $member,
                    'payments' => $memberPayments,
                    'totalAmount' => array_sum(array_column($memberPayments, 'amount'))
                ];
            }
        }
        
        $totalPayments = $stats['onlySocietaryCount'] + $stats['principalSportsCount'] + $stats['secondarySportsCount'];
        $totalAmount = $stats['onlySocietaryAmount'] + $stats['principalSportsAmount'] + $stats['secondarySportsAmount'];
        
        return [
            'stats' => $stats,
            'totalPayments' => $totalPayments,
            'totalAmount' => $totalAmount,
            'breakdown' => $breakdown
        ];
    }
    
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
     * Crea payments con NUEVA estructura de breakdown por items
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
                
                // Insertar breakdown items (lista plana)
                if (isset($payment['breakdownItems'])) {
                    $this->createPaymentBreakdownItems($paymentId, $payment['breakdownItems']);
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
     * Inserta items de breakdown (nueva estructura)
     */
    private function createPaymentBreakdownItems($paymentId, $breakdownItems) {
        $stmt = $this->db->prepare("
            INSERT INTO Payment_breakdowns (
                payment_id, member_id, member_name_snapshot,
                type, concept, description, amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($breakdownItems as $item) {
            $stmt->execute([
                $paymentId,
                $item['memberId'],
                $item['memberName'],
                $item['type'],
                $item['concept'],
                $item['description'] ?? null,
                $item['amount']
            ]);
        }
    }
    
    private function getGenerationById($generationId) {
        $stmt = $this->db->prepare("
            SELECT * FROM Payment_generations WHERE id = ?
        ");
        $stmt->execute([$generationId]);
        $gen = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$gen) {
            return null;
        }
        
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
    
    public function revertGeneration($generationId) {
        $this->db->beginTransaction();
        
        try {
            $stmt = $this->db->prepare("
                UPDATE Payment_generations 
                SET status = 'reverted', 
                    reverted_date = NOW(),
                    reverted_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$_SESSION['user_id'] ?? null, $generationId]);
            
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
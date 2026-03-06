-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 06-03-2026 a las 05:20:58
-- Versión del servidor: 10.11.15-MariaDB-ubu2204
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vps4_clubmanagement_sarmiento_prod`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Disciplines`
--

CREATE TABLE `Disciplines` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `abbreviation` varchar(5) DEFAULT NULL,
  `collector_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Family_groups`
--

CREATE TABLE `Family_groups` (
  `id` int(11) NOT NULL,
  `head_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Family_members`
--

CREATE TABLE `Family_members` (
  `id` int(11) NOT NULL,
  `family_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `relationship` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Members`
--

CREATE TABLE `Members` (
  `id` int(11) NOT NULL,
  `dni` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `second_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT '-',
  `email` varchar(50) NOT NULL DEFAULT '-',
  `address` text DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `societary_cuote` int(11) NOT NULL DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `family_status` enum('HEAD','MEMBER','NONE') DEFAULT 'NONE',
  `deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Members_disciplines`
--

CREATE TABLE `Members_disciplines` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `discipline_id` int(11) NOT NULL,
  `quote_id` int(11) NOT NULL,
  `principal_sport` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Partial_payments`
--

CREATE TABLE `Partial_payments` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_date` date NOT NULL,
  `payment_method` enum('cash','transfer','card','other') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Payments`
--

CREATE TABLE `Payments` (
  `id` int(11) NOT NULL,
  `generation_id` varchar(50) NOT NULL,
  `member_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `type` enum('societary-only','principal-sport','secondary-sport') NOT NULL,
  `sport_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` enum('pending','partial','paid','cancelled') NOT NULL DEFAULT 'pending',
  `paid_date` date DEFAULT NULL,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Payment_breakdowns`
--

CREATE TABLE `Payment_breakdowns` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `member_name_snapshot` varchar(255) NOT NULL,
  `type` enum('societary','principal-sport','secondary-sport') NOT NULL,
  `concept` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Payment_generations`
--

CREATE TABLE `Payment_generations` (
  `id` varchar(50) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `generated_date` datetime NOT NULL DEFAULT current_timestamp(),
  `generated_by` varchar(255) DEFAULT NULL,
  `status` enum('active','reverted') NOT NULL DEFAULT 'active',
  `reverted_date` datetime DEFAULT NULL,
  `reverted_by` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_payments` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `only_societary_count` int(11) NOT NULL DEFAULT 0,
  `only_societary_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `principal_sports_count` int(11) NOT NULL DEFAULT 0,
  `principal_sports_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `secondary_sports_count` int(11) NOT NULL DEFAULT 0,
  `secondary_sports_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `config_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config_snapshot`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profiles`
--

CREATE TABLE `profiles` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_plain` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Quotes`
--

CREATE TABLE `Quotes` (
  `id` int(11) NOT NULL,
  `discipline_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL DEFAULT '-',
  `description` varchar(100) DEFAULT NULL,
  `value` int(11) NOT NULL,
  `duration` int(11) DEFAULT 0,
  `type` enum('societaria','deportiva') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `can_add` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_view` tinyint(1) DEFAULT 1,
  `can_manage_payments` tinyint(1) DEFAULT 0,
  `can_generate_reports` tinyint(1) DEFAULT 0,
  `can_toggle_activate` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_sport`
--

CREATE TABLE `user_sport` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `sport_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Disciplines`
--
ALTER TABLE `Disciplines`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Family_groups`
--
ALTER TABLE `Family_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `head_id` (`head_id`);

--
-- Indices de la tabla `Family_members`
--
ALTER TABLE `Family_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indices de la tabla `Members`
--
ALTER TABLE `Members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_members_scuote` (`societary_cuote`);

--
-- Indices de la tabla `Members_disciplines`
--
ALTER TABLE `Members_disciplines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `discipline_id` (`discipline_id`),
  ADD KEY `fk_quote` (`quote_id`);

--
-- Indices de la tabla `Partial_payments`
--
ALTER TABLE `Partial_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment` (`payment_id`),
  ADD KEY `idx_paid_date` (`paid_date`);

--
-- Indices de la tabla `Payments`
--
ALTER TABLE `Payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sport_id` (`sport_id`),
  ADD KEY `idx_generation` (`generation_id`),
  ADD KEY `idx_member` (`member_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_period` (`year`,`month`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indices de la tabla `Payment_breakdowns`
--
ALTER TABLE `Payment_breakdowns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment` (`payment_id`),
  ADD KEY `idx_member` (`member_id`),
  ADD KEY `idx_type` (`type`);

--
-- Indices de la tabla `Payment_generations`
--
ALTER TABLE `Payment_generations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_period` (`year`,`month`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_generated_date` (`generated_date`);

--
-- Indices de la tabla `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indices de la tabla `Quotes`
--
ALTER TABLE `Quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discipline_id` (`discipline_id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD KEY `sessions_ibfk_1` (`user_id`);

--
-- Indices de la tabla `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `user_sport`
--
ALTER TABLE `user_sport`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sport_id` (`sport_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Disciplines`
--
ALTER TABLE `Disciplines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Family_groups`
--
ALTER TABLE `Family_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Family_members`
--
ALTER TABLE `Family_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Members`
--
ALTER TABLE `Members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Members_disciplines`
--
ALTER TABLE `Members_disciplines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Partial_payments`
--
ALTER TABLE `Partial_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Payments`
--
ALTER TABLE `Payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Payment_breakdowns`
--
ALTER TABLE `Payment_breakdowns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Quotes`
--
ALTER TABLE `Quotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user_sport`
--
ALTER TABLE `user_sport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Family_groups`
--
ALTER TABLE `Family_groups`
  ADD CONSTRAINT `Family_groups_ibfk_1` FOREIGN KEY (`head_id`) REFERENCES `Members` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `Family_members`
--
ALTER TABLE `Family_members`
  ADD CONSTRAINT `Family_members_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `Family_groups` (`id`),
  ADD CONSTRAINT `Family_members_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `Members` (`id`);

--
-- Filtros para la tabla `Members`
--
ALTER TABLE `Members`
  ADD CONSTRAINT `fk_members_scuote` FOREIGN KEY (`societary_cuote`) REFERENCES `Quotes` (`id`);

--
-- Filtros para la tabla `Members_disciplines`
--
ALTER TABLE `Members_disciplines`
  ADD CONSTRAINT `Members_disciplines_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `Members` (`id`),
  ADD CONSTRAINT `Members_disciplines_ibfk_2` FOREIGN KEY (`discipline_id`) REFERENCES `Disciplines` (`id`),
  ADD CONSTRAINT `fk_quote` FOREIGN KEY (`quote_id`) REFERENCES `Quotes` (`id`);

--
-- Filtros para la tabla `Partial_payments`
--
ALTER TABLE `Partial_payments`
  ADD CONSTRAINT `Partial_payments_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `Payments` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Payments`
--
ALTER TABLE `Payments`
  ADD CONSTRAINT `Payments_ibfk_1` FOREIGN KEY (`generation_id`) REFERENCES `Payment_generations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Payments_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `Members` (`id`),
  ADD CONSTRAINT `Payments_ibfk_3` FOREIGN KEY (`sport_id`) REFERENCES `Disciplines` (`id`);

--
-- Filtros para la tabla `Payment_breakdowns`
--
ALTER TABLE `Payment_breakdowns`
  ADD CONSTRAINT `fk_breakdown_member` FOREIGN KEY (`member_id`) REFERENCES `Members` (`id`),
  ADD CONSTRAINT `fk_breakdown_payment` FOREIGN KEY (`payment_id`) REFERENCES `Payments` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Quotes`
--
ALTER TABLE `Quotes`
  ADD CONSTRAINT `Quotes_ibfk_1` FOREIGN KEY (`discipline_id`) REFERENCES `Disciplines` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_sport`
--
ALTER TABLE `user_sport`
  ADD CONSTRAINT `user_sport_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_sport_ibfk_2` FOREIGN KEY (`sport_id`) REFERENCES `Disciplines` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Base de données pour Panel Veloria
CREATE DATABASE IF NOT EXISTS veloria_logs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veloria_logs;

-- Table des logs
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    player_name VARCHAR(100),
    player_id VARCHAR(50),
    discord_id VARCHAR(50),
    uuid VARCHAR(100),
    unique_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_player_id (player_id),
    INDEX idx_discord_id (discord_id),
    INDEX idx_uuid (uuid),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des utilisateurs autorisés
CREATE TABLE IF NOT EXISTS authorized_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Banco de dados do projeto elo (MySQL)
CREATE DATABASE IF NOT EXISTS elo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elo;

CREATE TABLE IF NOT EXISTS clientes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,          -- nunca guardamos a senha pura
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_email (email)
) ENGINE=InnoDB;

CREATE DATABASE  IF NOT EXISTS `financas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `financas`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: financas
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `payment_method_id` int DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `payment_type` enum('money','debit','credit') NOT NULL,
  `is_recurring` tinyint(1) DEFAULT '0',
  `paid` tinyint(1) DEFAULT '0',
  `paid_with_method_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `expenses_ibfk_2` (`payment_method_id`),
  KEY `expenses_ibfk_3` (`paid_with_method_id`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (21,1,1,'Macarrão',5.00,'2025-04-04','debit',0,1,1,'2025-04-07 23:58:34'),(22,1,1,'Arroz',5.00,'2025-04-04','debit',0,1,1,'2025-04-07 23:58:53'),(23,1,5,'Suco de Laranja',5.00,'2025-04-04','credit',0,1,2,'2025-04-08 00:02:18'),(24,1,5,'Suco de Uva',5.00,'2025-04-04','credit',0,1,1,'2025-04-08 00:03:12'),(25,1,5,'Bike',300.00,'2025-04-04','credit',0,0,NULL,'2025-04-08 00:03:40'),(31,1,1,'Dona novinha',5.00,'2025-04-16','debit',0,1,1,'2025-04-17 01:11:27'),(32,1,1,'Teste',0.25,'2025-04-16','debit',0,1,1,'2025-04-17 01:20:50'),(33,1,1,'Teste em Maio',5.00,'2025-05-14','debit',0,1,1,'2025-04-21 14:56:13'),(34,1,1,'Teste em Maio 2',5.00,'2025-05-22','debit',0,1,1,'2025-04-21 15:00:46'),(35,1,1,'Teste em Maio 3',5.00,'2025-05-06','debit',0,1,1,'2025-04-21 15:12:23'),(36,1,5,'Almoço',15.00,'2025-07-15','credit',0,0,NULL,'2025-04-21 15:13:49'),(37,1,1,'Teste atual',12.99,'2025-04-21','debit',0,1,1,'2025-04-21 15:18:06'),(38,1,5,'Teste Crédito',2.00,'2025-04-21','credit',0,1,4,'2025-04-21 17:23:18'),(39,3,1,'Conserva',10.00,'2025-11-01','debit',0,1,1,'2025-11-08 18:30:42'),(40,3,1,'Conserva',10.00,'2025-11-01','debit',0,1,1,'2025-11-08 18:31:16'),(41,3,1,'Almoço',25.00,'2025-11-12','credit',0,0,NULL,'2025-11-08 18:35:56'),(42,3,3,'Almoço',25.00,'2025-11-12','debit',0,1,3,'2025-11-08 18:50:36'),(43,3,3,'Gasolina',30.00,'2025-11-21','credit',0,0,NULL,'2025-11-08 18:50:57'),(44,3,1,'Teste 1',5.00,'2025-11-08','debit',0,1,1,'2025-11-08 19:02:19'),(45,3,2,'Teste 2',5.00,'2025-11-08','debit',0,1,2,'2025-11-08 19:02:55'),(46,3,2,'Teste 1',6.00,'2025-11-08','credit',0,0,NULL,'2025-11-08 19:03:15'),(48,1,4,'Merenda 2',15.00,'2025-11-20','credit',0,0,NULL,'2025-11-20 14:30:22'),(49,1,6,'Merenda',10.00,'2025-11-21','debit',0,1,6,'2025-11-21 19:18:24'),(50,1,6,'Merenda 3',10.00,'2025-11-21','credit',0,0,NULL,'2025-11-21 19:18:35');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `balance` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,3,'Santander','2025-11-08 17:56:36',97.00),(2,3,'NuBank','2025-11-08 18:13:44',6.00),(4,1,'Next','2025-11-20 01:06:25',100.00),(5,1,'Santander','2025-11-20 13:57:02',142.00),(6,1,'Nubank','2025-11-21 19:17:59',40.00);
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
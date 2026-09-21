/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.19-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: blood_donor_system
-- ------------------------------------------------------
-- Server version	10.11.19-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,'Administrator','admin@admin.com','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','2026-09-17 19:02:41');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blood_camps`
--

DROP TABLE IF EXISTS `blood_camps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `blood_camps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `camp_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location` text NOT NULL,
  `description` text DEFAULT NULL,
  `budget_amount` decimal(12,2) DEFAULT NULL,
  `status` enum('Upcoming','Completed','Cancelled') DEFAULT 'Upcoming',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_camp_date` (`camp_date`),
  KEY `idx_camp_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blood_camps`
--

LOCK TABLES `blood_camps` WRITE;
/*!40000 ALTER TABLE `blood_camps` DISABLE KEYS */;
INSERT INTO `blood_camps` VALUES
(1,'Annual Mega Blood Drive','2024-05-15','09:00:00','16:00:00','Town Hall, Colombo','Annual community blood donation drive organized by the Lions Club.',50000.00,'Upcoming','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(2,'University Blood Camp','2024-03-10','08:30:00','14:00:00','University of Peradeniya','Blood donation camp organized by the students union.',25000.00,'Completed','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(3,'Corporate Donation Day','2024-06-20','10:00:00','15:00:00','Tech Park, Malabe','Corporate blood donation day for tech employees.',75000.00,'Upcoming','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(4,'Vesak Poya Blood Drive','2024-05-23','08:00:00','15:00:00','Gangaramaya Temple','Mega blood drive for Vesak.',100000.00,'Completed','2026-09-17 19:43:54','2026-09-17 19:43:54'),
(5,'Poson Poya Blood Drive','2024-06-21','08:00:00','15:00:00','Ruwanwelisaya, Anuradhapura','Blood drive for Poson.',120000.00,'Upcoming','2026-09-17 19:43:54','2026-09-17 19:43:54'),
(6,'IT Sector Blood Drive','2024-04-10','09:00:00','16:00:00','Trace Expert City','Tech community blood drive.',80000.00,'Completed','2026-09-17 19:43:54','2026-09-17 19:43:54');
/*!40000 ALTER TABLE `blood_camps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blood_requests`
--

DROP TABLE IF EXISTS `blood_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `blood_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `requester_name` varchar(255) NOT NULL,
  `contact_mobile` varchar(20) NOT NULL,
  `blood_group` varchar(5) NOT NULL,
  `units_needed` int(11) NOT NULL DEFAULT 1,
  `hospital_name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `urgency` enum('Low','Moderate','High','Critical') NOT NULL DEFAULT 'Moderate',
  `details` text DEFAULT NULL,
  `status` enum('Open','Matched','Closed') NOT NULL DEFAULT 'Open',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `blood_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blood_requests`
--

LOCK TABLES `blood_requests` WRITE;
/*!40000 ALTER TABLE `blood_requests` DISABLE KEYS */;
INSERT INTO `blood_requests` VALUES
(1,6,'Demo Portal User 1','0712000001','A+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(2,7,'Demo Portal User 2','0712000002','A-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(3,8,'Demo Portal User 3','0712000003','B+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(4,9,'Demo Portal User 4','0712000004','B-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(5,10,'Demo Portal User 5','0712000005','AB+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(6,11,'Demo Portal User 6','0712000006','AB-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(7,12,'Demo Portal User 7','0712000007','O+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(8,13,'Demo Portal User 8','0712000008','O-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(9,14,'Demo Portal User 9','0712000009','A+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(10,15,'Demo Portal User 10','0712000010','A-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(11,16,'Demo Portal User 11','0712000011','B+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(12,17,'Demo Portal User 12','0712000012','B-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(13,18,'Demo Portal User 13','0712000013','AB+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(14,19,'Demo Portal User 14','0712000014','AB-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(15,20,'Demo Portal User 15','0712000015','O+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(16,21,'Demo Portal User 16','0712000016','O-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(17,22,'Demo Portal User 17','0712000017','A+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(18,23,'Demo Portal User 18','0712000018','A-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(19,24,'Demo Portal User 19','0712000019','B+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(20,25,'Demo Portal User 20','0712000020','B-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(21,26,'Demo Portal User 21','0712000021','AB+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(22,27,'Demo Portal User 22','0712000022','AB-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(23,28,'Demo Portal User 23','0712000023','O+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(24,29,'Demo Portal User 24','0712000024','O-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(25,30,'Demo Portal User 25','0712000025','A+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(26,31,'Demo Portal User 26','0712000026','A-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(27,32,'Demo Portal User 27','0712000027','B+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(28,33,'Demo Portal User 28','0712000028','B-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(29,34,'Demo Portal User 29','0712000029','AB+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(30,35,'Demo Portal User 30','0712000030','AB-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(31,36,'Demo Portal User 31','0712000031','O+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(32,37,'Demo Portal User 32','0712000032','O-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(33,38,'Demo Portal User 33','0712000033','A+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(34,39,'Demo Portal User 34','0712000034','A-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(35,40,'Demo Portal User 35','0712000035','B+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(36,41,'Demo Portal User 36','0712000036','B-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(37,42,'Demo Portal User 37','0712000037','AB+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(38,43,'Demo Portal User 38','0712000038','AB-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(39,44,'Demo Portal User 39','0712000039','O+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(40,45,'Demo Portal User 40','0712000040','O-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(41,46,'Demo Portal User 41','0712000041','A+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(42,47,'Demo Portal User 42','0712000042','A-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(43,48,'Demo Portal User 43','0712000043','B+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(44,49,'Demo Portal User 44','0712000044','B-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(45,50,'Demo Portal User 45','0712000045','AB+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(46,51,'Demo Portal User 46','0712000046','AB-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(47,52,'Demo Portal User 47','0712000047','O+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(48,53,'Demo Portal User 48','0712000048','O-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(49,54,'Demo Portal User 49','0712000049','A+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(50,55,'Demo Portal User 50','0712000050','A-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(51,56,'Demo Portal User 51','0712000051','B+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(52,57,'Demo Portal User 52','0712000052','B-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(53,58,'Demo Portal User 53','0712000053','AB+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(54,59,'Demo Portal User 54','0712000054','AB-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(55,60,'Demo Portal User 55','0712000055','O+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(56,61,'Demo Portal User 56','0712000056','O-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(57,62,'Demo Portal User 57','0712000057','A+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(58,63,'Demo Portal User 58','0712000058','A-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(59,64,'Demo Portal User 59','0712000059','B+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(60,65,'Demo Portal User 60','0712000060','B-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(61,66,'Demo Portal User 61','0712000061','AB+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(62,67,'Demo Portal User 62','0712000062','AB-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(63,68,'Demo Portal User 63','0712000063','O+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(64,69,'Demo Portal User 64','0712000064','O-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(65,70,'Demo Portal User 65','0712000065','A+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(66,71,'Demo Portal User 66','0712000066','A-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(67,72,'Demo Portal User 67','0712000067','B+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(68,73,'Demo Portal User 68','0712000068','B-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(69,74,'Demo Portal User 69','0712000069','AB+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(70,75,'Demo Portal User 70','0712000070','AB-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(71,76,'Demo Portal User 71','0712000071','O+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(72,77,'Demo Portal User 72','0712000072','O-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(73,78,'Demo Portal User 73','0712000073','A+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(74,79,'Demo Portal User 74','0712000074','A-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(75,80,'Demo Portal User 75','0712000075','B+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(76,81,'Demo Portal User 76','0712000076','B-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(77,82,'Demo Portal User 77','0712000077','AB+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(78,83,'Demo Portal User 78','0712000078','AB-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(79,84,'Demo Portal User 79','0712000079','O+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(80,85,'Demo Portal User 80','0712000080','O-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(81,86,'Demo Portal User 81','0712000081','A+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(82,87,'Demo Portal User 82','0712000082','A-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(83,88,'Demo Portal User 83','0712000083','B+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(84,89,'Demo Portal User 84','0712000084','B-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(85,90,'Demo Portal User 85','0712000085','AB+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(86,91,'Demo Portal User 86','0712000086','AB-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(87,92,'Demo Portal User 87','0712000087','O+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(88,93,'Demo Portal User 88','0712000088','O-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(89,94,'Demo Portal User 89','0712000089','A+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(90,95,'Demo Portal User 90','0712000090','A-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(91,96,'Demo Portal User 91','0712000091','B+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(92,97,'Demo Portal User 92','0712000092','B-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(93,98,'Demo Portal User 93','0712000093','AB+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(94,99,'Demo Portal User 94','0712000094','AB-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(95,100,'Demo Portal User 95','0712000095','O+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(96,101,'Demo Portal User 96','0712000096','O-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(97,102,'Demo Portal User 97','0712000097','A+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(98,103,'Demo Portal User 98','0712000098','A-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(99,104,'Demo Portal User 99','0712000099','B+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(100,105,'Demo Portal User 100','0712000100','B-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(101,106,'Demo Portal User 101','0712000101','AB+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(102,107,'Demo Portal User 102','0712000102','AB-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(103,108,'Demo Portal User 103','0712000103','O+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(104,109,'Demo Portal User 104','0712000104','O-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(105,110,'Demo Portal User 105','0712000105','A+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(106,111,'Demo Portal User 106','0712000106','A-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(107,112,'Demo Portal User 107','0712000107','B+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(108,113,'Demo Portal User 108','0712000108','B-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(109,114,'Demo Portal User 109','0712000109','AB+',3,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(110,115,'Demo Portal User 110','0712000110','AB-',1,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(111,116,'Demo Portal User 111','0712000111','O+',2,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(112,117,'Demo Portal User 112','0712000112','O-',3,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(113,118,'Demo Portal User 113','0712000113','A+',1,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(114,119,'Demo Portal User 114','0712000114','A-',2,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(115,120,'Demo Portal User 115','0712000115','B+',3,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(116,121,'Demo Portal User 116','0712000116','B-',1,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(117,122,'Demo Portal User 117','0712000117','AB+',2,'General Hospital','Kandy','Moderate','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36'),
(118,123,'Demo Portal User 118','0712000118','AB-',3,'Teaching Hospital','Galle','High','Development seed request for admin workflow testing.','Closed','2026-09-18 17:16:36'),
(119,124,'Demo Portal User 119','0712000119','O+',1,'District Hospital','Jaffna','Critical','Development seed request for admin workflow testing.','Open','2026-09-18 17:16:36'),
(120,125,'Demo Portal User 120','0712000120','O-',2,'National Hospital','Colombo','Low','Development seed request for admin workflow testing.','Matched','2026-09-18 17:16:36');
/*!40000 ALTER TABLE `blood_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camp_contributions`
--

DROP TABLE IF EXISTS `camp_contributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_contributions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `camp_id` int(11) NOT NULL,
  `contributor_name` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `category` enum('Food','Drinks','Water','Snacks','Medical','Equipment','Cash','Other') NOT NULL DEFAULT 'Food',
  `item_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `status` enum('Pledged','Received') NOT NULL DEFAULT 'Received',
  `received_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `recorded_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `idx_contrib_camp` (`camp_id`),
  KEY `idx_contrib_category` (`category`),
  KEY `idx_contrib_status` (`status`),
  CONSTRAINT `camp_contributions_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `blood_camps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `camp_contributions_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camp_contributions`
--

LOCK TABLES `camp_contributions` WRITE;
/*!40000 ALTER TABLE `camp_contributions` DISABLE KEYS */;
INSERT INTO `camp_contributions` VALUES
(1,4,'Saman Kumara','0771231234','Cash',NULL,NULL,NULL,25000.00,'Received','2024-05-20',NULL,'2026-09-17 19:44:29','2026-09-17 19:44:29',NULL),
(2,4,'Lions Club','0711122334','Cash',NULL,NULL,NULL,50000.00,'Received','2024-05-21',NULL,'2026-09-17 19:44:29','2026-09-17 19:44:29',NULL),
(3,4,'Nestle Lanka',NULL,'Drinks','Milo Packets',200.00,'Packets',15000.00,'Received',NULL,NULL,'2026-09-17 19:45:25','2026-09-17 19:45:25',NULL),
(4,4,'Munchee',NULL,'Snacks','Biscuits',100.00,'Packets',10000.00,'Received',NULL,NULL,'2026-09-17 19:45:25','2026-09-17 19:45:25',NULL);
/*!40000 ALTER TABLE `camp_contributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camp_expenses`
--

DROP TABLE IF EXISTS `camp_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `camp_id` int(11) NOT NULL,
  `category` enum('Food','Drinks','Water','Transport','Printing','Venue','Medical','Decoration','Volunteer','Other') NOT NULL DEFAULT 'Other',
  `description` varchar(255) NOT NULL,
  `paid_to` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('Cash','Bank Transfer','Card','Online','Other') NOT NULL DEFAULT 'Cash',
  `status` enum('Planned','Paid') NOT NULL DEFAULT 'Paid',
  `expense_date` date DEFAULT NULL,
  `receipt_no` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `recorded_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `idx_expense_camp` (`camp_id`),
  KEY `idx_expense_category` (`category`),
  KEY `idx_expense_status` (`status`),
  CONSTRAINT `camp_expenses_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `blood_camps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `camp_expenses_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camp_expenses`
--

LOCK TABLES `camp_expenses` WRITE;
/*!40000 ALTER TABLE `camp_expenses` DISABLE KEYS */;
INSERT INTO `camp_expenses` VALUES
(4,4,'Venue','Hall booking',NULL,15000.00,'Bank Transfer','Paid','2024-05-15',NULL,NULL,'2026-09-17 19:45:43','2026-09-17 19:45:43',NULL),
(5,4,'Other','Beds & Tents',NULL,20000.00,'Cash','Paid','2024-05-20',NULL,NULL,'2026-09-17 19:45:43','2026-09-17 19:45:43',NULL),
(6,4,'Food','Lunch for staff',NULL,12000.00,'Cash','Paid','2024-05-23',NULL,NULL,'2026-09-17 19:45:43','2026-09-17 19:45:43',NULL);
/*!40000 ALTER TABLE `camp_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camp_registrations`
--

DROP TABLE IF EXISTS `camp_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `camp_id` int(11) NOT NULL,
  `donor_id` int(11) DEFAULT NULL,
  `serial_no` int(11) DEFAULT NULL,
  `mobile` varchar(20) NOT NULL,
  `donor_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `status` enum('Registered','Donated','Rejected','No Show') DEFAULT 'Registered',
  `remarks` text DEFAULT NULL,
  `registered_at` datetime DEFAULT current_timestamp(),
  `registered_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_camp_mobile` (`camp_id`,`mobile`),
  KEY `donor_id` (`donor_id`),
  KEY `idx_camp` (`camp_id`),
  KEY `idx_reg_status` (`status`),
  KEY `idx_reg_mobile` (`mobile`),
  CONSTRAINT `camp_registrations_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `blood_camps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `camp_registrations_ibfk_2` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camp_registrations`
--

LOCK TABLES `camp_registrations` WRITE;
/*!40000 ALTER TABLE `camp_registrations` DISABLE KEYS */;
INSERT INTO `camp_registrations` VALUES
(1,4,1,NULL,'0711111101','Kamal Perera',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 08:15:00',NULL),
(2,4,2,NULL,'0711111102','Nimal Silva',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 08:30:00',NULL),
(3,4,3,NULL,'0711111103','Sunil Fernando',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 08:45:00',NULL),
(4,4,4,NULL,'0711111104','Chathurika Peiris',NULL,NULL,NULL,NULL,'Rejected',NULL,'2024-05-23 09:00:00',NULL),
(5,4,5,NULL,'0711111105','Amala Dissanayake',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 09:15:00',NULL),
(6,4,6,NULL,'0711111106','Ruwan Rathnayake',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 09:30:00',NULL),
(7,4,7,NULL,'0711111107','Thilini Wijesinghe',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 09:45:00',NULL),
(8,4,8,NULL,'0711111108','Saman Kumara',NULL,NULL,NULL,NULL,'Registered',NULL,'2024-05-23 10:00:00',NULL),
(9,4,9,NULL,'0711111109','Nuwan Pradeep',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 10:15:00',NULL),
(10,4,10,NULL,'0711111110','Kavindi Silva',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-05-23 10:30:00',NULL),
(11,6,11,NULL,'0711111111','Gayan Senanayake',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-04-10 09:15:00',NULL),
(12,6,12,NULL,'0711111112','Oshadi Ranasinghe',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-04-10 09:30:00',NULL),
(13,6,13,NULL,'0711111113','Dilshan Jayakody',NULL,NULL,NULL,NULL,'Rejected',NULL,'2024-04-10 09:45:00',NULL),
(14,6,14,NULL,'0711111114','Chamari Athapaththu',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-04-10 10:00:00',NULL),
(15,6,15,NULL,'0711111115','Mahela Jayawardene',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-04-10 10:15:00',NULL),
(16,6,16,NULL,'0711111116','Kumar Sangakkara',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-04-10 10:30:00',NULL),
(17,6,17,NULL,'0711111117','Lasith Malinga',NULL,NULL,NULL,NULL,'Registered',NULL,'2024-04-10 10:45:00',NULL),
(18,6,18,NULL,'0711111118','Muttiah Muralitharan',NULL,NULL,NULL,NULL,'Donated',NULL,'2024-04-10 11:00:00',NULL);
/*!40000 ALTER TABLE `camp_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donors`
--

DROP TABLE IF EXISTS `donors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `donors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `blood_group` varchar(5) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `last_donation_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mobile` (`mobile`),
  KEY `idx_blood_group` (`blood_group`),
  KEY `idx_status` (`status`),
  KEY `idx_last_donation` (`last_donation_date`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donors`
--

LOCK TABLES `donors` WRITE;
/*!40000 ALTER TABLE `donors` DISABLE KEYS */;
INSERT INTO `donors` VALUES
(1,'John Doe','0712345678','0712345678','john@example.com','123 Main St, Colombo','O+','Male','1990-05-15','2023-11-20','Active','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(2,'Jane Smith','0779876543','0779876543','jane@example.com','45 Park Ave, Kandy','A-','Female','1985-08-22','2024-01-10','Active','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(3,'Alex Johnson','0721112222',NULL,'alex@example.com','Galle Road, Galle','B+','Male','1995-12-05','2023-09-15','Active','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(4,'Emily Davis','0783334444','0783334444','emily@example.com','Temple Road, Jaffna','AB+','Female','1992-03-30',NULL,'Active','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(5,'Michael Brown','0755556666','0755556666','michael@example.com','Flower Road, Colombo','O-','Male','1988-11-11','2024-02-28','Inactive','2026-09-17 19:18:19','2026-09-17 19:18:19'),
(6,'Kamal Perera','0711111101',NULL,NULL,NULL,'A+','Male','1985-01-10','2023-10-01','Active','2023-01-01 00:00:00','2026-09-17 19:43:54'),
(7,'Nimal Silva','0711111102',NULL,NULL,NULL,'B+','Male','1990-02-15','2023-11-05','Active','2023-01-05 00:00:00','2026-09-17 19:43:54'),
(8,'Sunil Fernando','0711111103',NULL,NULL,NULL,'O+','Male','1988-03-20','2023-12-10','Active','2023-02-10 00:00:00','2026-09-17 19:43:54'),
(9,'Chathurika Peiris','0711111104',NULL,NULL,NULL,'AB+','Female','1995-04-25','2024-01-15','Active','2023-03-15 00:00:00','2026-09-17 19:43:54'),
(10,'Amala Dissanayake','0711111105',NULL,NULL,NULL,'A-','Female','1992-05-30','2024-02-20','Active','2023-04-20 00:00:00','2026-09-17 19:43:54'),
(11,'Ruwan Rathnayake','0711111106',NULL,NULL,NULL,'B-','Male','1980-06-05','2023-09-25','Active','2023-05-25 00:00:00','2026-09-17 19:43:54'),
(12,'Thilini Wijesinghe','0711111107',NULL,NULL,NULL,'O-','Female','1987-07-10','2023-08-30','Active','2023-06-30 00:00:00','2026-09-17 19:43:54'),
(13,'Saman Kumara','0711111108',NULL,NULL,NULL,'AB-','Male','1993-08-15','2023-07-05','Active','2023-07-05 00:00:00','2026-09-17 19:43:54'),
(14,'Nuwan Pradeep','0711111109',NULL,NULL,NULL,'A+','Male','1998-09-20','2023-06-10','Active','2023-08-10 00:00:00','2026-09-17 19:43:54'),
(15,'Kavindi Silva','0711111110',NULL,NULL,NULL,'B+','Female','2000-10-25','2023-05-15','Active','2023-09-15 00:00:00','2026-09-17 19:43:54'),
(16,'Gayan Senanayake','0711111111',NULL,NULL,NULL,'O+','Male','1975-11-30','2023-04-20','Active','2023-10-20 00:00:00','2026-09-17 19:43:54'),
(17,'Oshadi Ranasinghe','0711111112',NULL,NULL,NULL,'A-','Female','1982-12-05','2023-03-25','Active','2023-11-25 00:00:00','2026-09-17 19:43:54'),
(18,'Dilshan Jayakody','0711111113',NULL,NULL,NULL,'B-','Male','1989-01-10','2023-02-28','Active','2023-12-28 00:00:00','2026-09-17 19:43:54'),
(19,'Chamari Athapaththu','0711111114',NULL,NULL,NULL,'O-','Female','1994-02-15','2023-01-05','Active','2024-01-05 00:00:00','2026-09-17 19:43:54'),
(20,'Mahela Jayawardene','0711111115',NULL,NULL,NULL,'AB+','Male','1978-03-20','2022-12-10','Active','2024-02-10 00:00:00','2026-09-17 19:43:54'),
(21,'Kumar Sangakkara','0711111116',NULL,NULL,NULL,'A+','Male','1983-04-25','2022-11-15','Active','2024-03-15 00:00:00','2026-09-17 19:43:54'),
(22,'Lasith Malinga','0711111117',NULL,NULL,NULL,'B+','Male','1986-05-30','2022-10-20','Inactive','2024-04-20 00:00:00','2026-09-17 19:43:54'),
(23,'Muttiah Muralitharan','0711111118',NULL,NULL,NULL,'O+','Male','1972-06-05','2022-09-25','Active','2024-05-25 00:00:00','2026-09-17 19:43:54'),
(24,'Sanath Jayasuriya','0711111119',NULL,NULL,NULL,'AB-','Male','1969-07-10','2022-08-30','Active','2024-06-30 00:00:00','2026-09-17 19:43:54'),
(25,'Aravinda de Silva','0711111120',NULL,NULL,NULL,'A-','Male','1965-08-15','2022-07-05','Active','2024-07-05 00:00:00','2026-09-17 19:43:54');
/*!40000 ALTER TABLE `donors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `successful` tinyint(1) NOT NULL DEFAULT 0,
  `attempted_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_attempt_email` (`email`,`attempted_at`),
  KEY `idx_attempt_ip` (`ip_address`,`attempted_at`),
  KEY `idx_attempt_time` (`attempted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES
(1,'missing@example.com','::1',0,'2026-09-18 16:59:04'),
(2,'admin@admin.com','::ffff:172.18.0.3',1,'2026-09-18 17:00:58'),
(3,'demo_donor','::1',1,'2026-09-18 17:04:36'),
(4,'admin@admin.com','::ffff:172.18.0.4',1,'2026-09-18 17:11:47'),
(5,'sv@admin.com','::ffff:172.18.0.4',1,'2026-09-18 17:13:22'),
(6,'sv','::ffff:172.18.0.4',1,'2026-09-18 17:15:20'),
(7,'demo_user_001','::ffff:172.18.0.4',1,'2026-09-18 17:18:42'),
(8,'admin@admin.com','::ffff:172.18.0.4',1,'2026-09-18 17:19:53'),
(9,'sv','::ffff:172.18.0.2',1,'2026-09-18 17:25:43'),
(10,'admin@admin.com','::ffff:172.18.0.2',1,'2026-09-18 17:26:05'),
(11,'admin@admin.com','::ffff:172.18.0.2',0,'2026-09-18 17:31:46'),
(12,'admin@admin.com','::ffff:172.18.0.2',1,'2026-09-18 17:31:53'),
(13,'sv','::ffff:172.18.0.2',1,'2026-09-18 17:32:01'),
(14,'admin@admin.com','::ffff:172.18.0.2',1,'2026-09-18 17:37:20'),
(15,'sv','::ffff:172.18.0.2',1,'2026-09-18 17:37:27');
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_logs`
--

DROP TABLE IF EXISTS `message_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `campaign_id` char(32) DEFAULT NULL,
  `message_type` enum('WhatsApp','SMS') NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `api_response` text DEFAULT NULL,
  `sent_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `donor_id` (`donor_id`),
  KEY `staff_id` (`staff_id`),
  KEY `idx_campaign` (`campaign_id`,`status`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_message_type` (`message_type`),
  CONSTRAINT `message_logs_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `message_logs_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_logs`
--

LOCK TABLES `message_logs` WRITE;
/*!40000 ALTER TABLE `message_logs` DISABLE KEYS */;
INSERT INTO `message_logs` VALUES
(1,1,NULL,NULL,'WhatsApp','0711111101','Please attend our camp tomorrow.','Sent',NULL,'2024-05-20 09:00:00'),
(2,2,NULL,NULL,'WhatsApp','0711111102','Please attend our camp tomorrow.','Sent',NULL,'2024-05-20 09:00:01'),
(3,3,NULL,NULL,'WhatsApp','0711111103','Please attend our camp tomorrow.','Failed',NULL,'2024-05-20 09:00:02'),
(4,4,NULL,NULL,'WhatsApp','0711111104','Please attend our camp tomorrow.','Sent',NULL,'2024-05-20 09:00:03'),
(5,5,NULL,NULL,'SMS','0711111105','Please attend our camp tomorrow.','Sent',NULL,'2024-05-20 09:00:04'),
(6,11,NULL,NULL,'WhatsApp','0711111111','Urgent O+ blood needed at General Hospital.','Sent',NULL,'2024-04-05 10:00:00'),
(7,12,NULL,NULL,'WhatsApp','0711111112','Urgent O+ blood needed at General Hospital.','Sent',NULL,'2024-04-05 10:00:01'),
(8,13,NULL,NULL,'SMS','0711111113','Urgent O+ blood needed at General Hospital.','Sent',NULL,'2024-04-05 10:00:02');
/*!40000 ALTER TABLE `message_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_templates`
--

DROP TABLE IF EXISTS `message_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_name` varchar(255) NOT NULL,
  `template_body` text NOT NULL,
  `template_type` enum('Camp Notification','Emergency Request','General') DEFAULT 'General',
  `whatsapp_template_name` varchar(255) DEFAULT NULL,
  `whatsapp_language` varchar(10) NOT NULL DEFAULT 'en',
  `whatsapp_variables` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_templates`
--

LOCK TABLES `message_templates` WRITE;
/*!40000 ALTER TABLE `message_templates` DISABLE KEYS */;
INSERT INTO `message_templates` VALUES
(1,'Blood Camp Notification','Hello {NAME},\n\nOur upcoming blood donation camp will be held on:\n\nDate: {DATE}\nLocation: {LOCATION}\n\nWe would be grateful for your participation.\n\nThank you.','Camp Notification','blood_camp_notification','en','NAME,DATE,LOCATION','2026-09-17 19:02:41'),
(2,'Emergency Blood Request','Urgent Blood Request\n\nBlood Group: {BLOOD_GROUP}\nLocation: {LOCATION}\n\nPlease contact us immediately if you can donate.\n\nThank you.','Emergency Request','emergency_blood_request','en','BLOOD_GROUP,LOCATION','2026-09-17 19:02:41'),
(3,'General Announcement','Hello {NAME},\n\n{MESSAGE}\n\nThank you.','General','general_announcement','en','NAME,MESSAGE','2026-09-17 19:02:41'),
(4,'Blood Camp Notification (Sinhala)','ආයුබෝවන් {NAME},\n\nඅපගේ මීළඟ රුධිර දන්දීමේ කඳවුර පහත පරිදි පැවැත්වේ.\n\nදිනය: {DATE}\nස්ථානය: {LOCATION}\n\nඔබගේ සහභාගීත්වය අපි බෙහෙවින් අගය කරමු.\n\nස්තූතියි.','Camp Notification','blood_camp_notification','si','NAME,DATE,LOCATION','2026-09-17 19:02:41'),
(5,'Emergency Blood Request (Sinhala)','හදිසි රුධිර අවශ්‍යතාවයකි\n\nරුධිර කාණ්ඩය: {BLOOD_GROUP}\nස්ථානය: {LOCATION}\n\nඔබට රුධිර පරිත්‍යාග කළ හැකි නම්, කරුණාකර වහාම අප හා සම්බන්ධ වන්න.\n\nස්තූතියි.','Emergency Request','emergency_blood_request','si','BLOOD_GROUP,LOCATION','2026-09-17 19:02:41'),
(6,'General Announcement (Sinhala)','ආයුබෝවන් {NAME},\n\n{MESSAGE}\n\nස්තූතියි.','General','general_announcement','si','NAME,MESSAGE','2026-09-17 19:02:41');
/*!40000 ALTER TABLE `message_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `checksum` char(64) NOT NULL,
  `applied_at` datetime NOT NULL DEFAULT current_timestamp(),
  `method` enum('applied','baseline') NOT NULL DEFAULT 'applied',
  PRIMARY KEY (`id`),
  UNIQUE KEY `filename` (`filename`),
  KEY `idx_migration_applied` (`applied_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_migrations`
--

LOCK TABLES `schema_migrations` WRITE;
/*!40000 ALTER TABLE `schema_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `schema_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
(1,'app_name','DotLife','2026-09-18 17:04:13'),
(2,'organization_name','Blood Donor Organization','2026-09-17 19:02:41'),
(3,'country_code','+94','2026-09-17 19:02:41'),
(4,'whatsapp_api_token','','2026-09-17 19:02:41'),
(5,'whatsapp_phone_number_id','','2026-09-17 19:02:41'),
(6,'whatsapp_api_version','v23.0','2026-09-17 19:02:41'),
(7,'sms_gateway','twilio','2026-09-17 19:02:41'),
(8,'sms_api_key','','2026-09-17 19:02:41'),
(9,'sms_api_secret','','2026-09-17 19:02:41'),
(10,'sms_sender_id','','2026-09-17 19:02:41'),
(11,'currency_symbol','Rs.','2026-09-17 19:02:41');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile` (`mobile`),
  KEY `idx_staff_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Demo Donor','demo_donor','donor@dotlife.test','0710000001','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:04:13','2026-09-18 17:04:13'),
(2,'Kavindu Perera','kavindu_p','kavindu@dotlife.test','0710000002','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:04:13','2026-09-18 17:04:13'),
(3,'Nadeesha Silva','nadeesha_s','nadeesha@dotlife.test','0710000003','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:04:13','2026-09-18 17:04:13'),
(5,'SV','sv','sv@admin.com','1234567890','O+','$2b$10$gxBy0PKmKpEFlcOcOjvdG.nzqll.2e8bc5kHPRi99IgkLQmTHYivm','user','Active','2026-09-18 17:13:22','2026-09-18 17:13:22'),
(6,'Demo Portal User 1','demo_user_001','demo.user.001@dotlife.test','0712000001','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(7,'Demo Portal User 2','demo_user_002','demo.user.002@dotlife.test','0712000002','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(8,'Demo Portal User 3','demo_user_003','demo.user.003@dotlife.test','0712000003','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(9,'Demo Portal User 4','demo_user_004','demo.user.004@dotlife.test','0712000004','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(10,'Demo Portal User 5','demo_user_005','demo.user.005@dotlife.test','0712000005','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(11,'Demo Portal User 6','demo_user_006','demo.user.006@dotlife.test','0712000006','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(12,'Demo Portal User 7','demo_user_007','demo.user.007@dotlife.test','0712000007','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(13,'Demo Portal User 8','demo_user_008','demo.user.008@dotlife.test','0712000008','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(14,'Demo Portal User 9','demo_user_009','demo.user.009@dotlife.test','0712000009','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(15,'Demo Portal User 10','demo_user_010','demo.user.010@dotlife.test','0712000010','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(16,'Demo Portal User 11','demo_user_011','demo.user.011@dotlife.test','0712000011','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(17,'Demo Portal User 12','demo_user_012','demo.user.012@dotlife.test','0712000012','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(18,'Demo Portal User 13','demo_user_013','demo.user.013@dotlife.test','0712000013','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(19,'Demo Portal User 14','demo_user_014','demo.user.014@dotlife.test','0712000014','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(20,'Demo Portal User 15','demo_user_015','demo.user.015@dotlife.test','0712000015','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(21,'Demo Portal User 16','demo_user_016','demo.user.016@dotlife.test','0712000016','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(22,'Demo Portal User 17','demo_user_017','demo.user.017@dotlife.test','0712000017','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(23,'Demo Portal User 18','demo_user_018','demo.user.018@dotlife.test','0712000018','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(24,'Demo Portal User 19','demo_user_019','demo.user.019@dotlife.test','0712000019','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(25,'Demo Portal User 20','demo_user_020','demo.user.020@dotlife.test','0712000020','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(26,'Demo Portal User 21','demo_user_021','demo.user.021@dotlife.test','0712000021','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(27,'Demo Portal User 22','demo_user_022','demo.user.022@dotlife.test','0712000022','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(28,'Demo Portal User 23','demo_user_023','demo.user.023@dotlife.test','0712000023','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(29,'Demo Portal User 24','demo_user_024','demo.user.024@dotlife.test','0712000024','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(30,'Demo Portal User 25','demo_user_025','demo.user.025@dotlife.test','0712000025','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(31,'Demo Portal User 26','demo_user_026','demo.user.026@dotlife.test','0712000026','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(32,'Demo Portal User 27','demo_user_027','demo.user.027@dotlife.test','0712000027','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(33,'Demo Portal User 28','demo_user_028','demo.user.028@dotlife.test','0712000028','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(34,'Demo Portal User 29','demo_user_029','demo.user.029@dotlife.test','0712000029','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(35,'Demo Portal User 30','demo_user_030','demo.user.030@dotlife.test','0712000030','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(36,'Demo Portal User 31','demo_user_031','demo.user.031@dotlife.test','0712000031','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(37,'Demo Portal User 32','demo_user_032','demo.user.032@dotlife.test','0712000032','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(38,'Demo Portal User 33','demo_user_033','demo.user.033@dotlife.test','0712000033','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(39,'Demo Portal User 34','demo_user_034','demo.user.034@dotlife.test','0712000034','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(40,'Demo Portal User 35','demo_user_035','demo.user.035@dotlife.test','0712000035','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(41,'Demo Portal User 36','demo_user_036','demo.user.036@dotlife.test','0712000036','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(42,'Demo Portal User 37','demo_user_037','demo.user.037@dotlife.test','0712000037','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(43,'Demo Portal User 38','demo_user_038','demo.user.038@dotlife.test','0712000038','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(44,'Demo Portal User 39','demo_user_039','demo.user.039@dotlife.test','0712000039','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(45,'Demo Portal User 40','demo_user_040','demo.user.040@dotlife.test','0712000040','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(46,'Demo Portal User 41','demo_user_041','demo.user.041@dotlife.test','0712000041','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(47,'Demo Portal User 42','demo_user_042','demo.user.042@dotlife.test','0712000042','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(48,'Demo Portal User 43','demo_user_043','demo.user.043@dotlife.test','0712000043','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(49,'Demo Portal User 44','demo_user_044','demo.user.044@dotlife.test','0712000044','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(50,'Demo Portal User 45','demo_user_045','demo.user.045@dotlife.test','0712000045','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(51,'Demo Portal User 46','demo_user_046','demo.user.046@dotlife.test','0712000046','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(52,'Demo Portal User 47','demo_user_047','demo.user.047@dotlife.test','0712000047','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(53,'Demo Portal User 48','demo_user_048','demo.user.048@dotlife.test','0712000048','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(54,'Demo Portal User 49','demo_user_049','demo.user.049@dotlife.test','0712000049','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(55,'Demo Portal User 50','demo_user_050','demo.user.050@dotlife.test','0712000050','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(56,'Demo Portal User 51','demo_user_051','demo.user.051@dotlife.test','0712000051','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(57,'Demo Portal User 52','demo_user_052','demo.user.052@dotlife.test','0712000052','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(58,'Demo Portal User 53','demo_user_053','demo.user.053@dotlife.test','0712000053','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(59,'Demo Portal User 54','demo_user_054','demo.user.054@dotlife.test','0712000054','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(60,'Demo Portal User 55','demo_user_055','demo.user.055@dotlife.test','0712000055','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(61,'Demo Portal User 56','demo_user_056','demo.user.056@dotlife.test','0712000056','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(62,'Demo Portal User 57','demo_user_057','demo.user.057@dotlife.test','0712000057','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(63,'Demo Portal User 58','demo_user_058','demo.user.058@dotlife.test','0712000058','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(64,'Demo Portal User 59','demo_user_059','demo.user.059@dotlife.test','0712000059','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(65,'Demo Portal User 60','demo_user_060','demo.user.060@dotlife.test','0712000060','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(66,'Demo Portal User 61','demo_user_061','demo.user.061@dotlife.test','0712000061','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(67,'Demo Portal User 62','demo_user_062','demo.user.062@dotlife.test','0712000062','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(68,'Demo Portal User 63','demo_user_063','demo.user.063@dotlife.test','0712000063','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(69,'Demo Portal User 64','demo_user_064','demo.user.064@dotlife.test','0712000064','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(70,'Demo Portal User 65','demo_user_065','demo.user.065@dotlife.test','0712000065','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(71,'Demo Portal User 66','demo_user_066','demo.user.066@dotlife.test','0712000066','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(72,'Demo Portal User 67','demo_user_067','demo.user.067@dotlife.test','0712000067','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(73,'Demo Portal User 68','demo_user_068','demo.user.068@dotlife.test','0712000068','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(74,'Demo Portal User 69','demo_user_069','demo.user.069@dotlife.test','0712000069','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(75,'Demo Portal User 70','demo_user_070','demo.user.070@dotlife.test','0712000070','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(76,'Demo Portal User 71','demo_user_071','demo.user.071@dotlife.test','0712000071','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(77,'Demo Portal User 72','demo_user_072','demo.user.072@dotlife.test','0712000072','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(78,'Demo Portal User 73','demo_user_073','demo.user.073@dotlife.test','0712000073','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(79,'Demo Portal User 74','demo_user_074','demo.user.074@dotlife.test','0712000074','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(80,'Demo Portal User 75','demo_user_075','demo.user.075@dotlife.test','0712000075','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(81,'Demo Portal User 76','demo_user_076','demo.user.076@dotlife.test','0712000076','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(82,'Demo Portal User 77','demo_user_077','demo.user.077@dotlife.test','0712000077','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(83,'Demo Portal User 78','demo_user_078','demo.user.078@dotlife.test','0712000078','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(84,'Demo Portal User 79','demo_user_079','demo.user.079@dotlife.test','0712000079','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(85,'Demo Portal User 80','demo_user_080','demo.user.080@dotlife.test','0712000080','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(86,'Demo Portal User 81','demo_user_081','demo.user.081@dotlife.test','0712000081','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(87,'Demo Portal User 82','demo_user_082','demo.user.082@dotlife.test','0712000082','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(88,'Demo Portal User 83','demo_user_083','demo.user.083@dotlife.test','0712000083','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(89,'Demo Portal User 84','demo_user_084','demo.user.084@dotlife.test','0712000084','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(90,'Demo Portal User 85','demo_user_085','demo.user.085@dotlife.test','0712000085','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(91,'Demo Portal User 86','demo_user_086','demo.user.086@dotlife.test','0712000086','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(92,'Demo Portal User 87','demo_user_087','demo.user.087@dotlife.test','0712000087','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(93,'Demo Portal User 88','demo_user_088','demo.user.088@dotlife.test','0712000088','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(94,'Demo Portal User 89','demo_user_089','demo.user.089@dotlife.test','0712000089','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(95,'Demo Portal User 90','demo_user_090','demo.user.090@dotlife.test','0712000090','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(96,'Demo Portal User 91','demo_user_091','demo.user.091@dotlife.test','0712000091','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(97,'Demo Portal User 92','demo_user_092','demo.user.092@dotlife.test','0712000092','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(98,'Demo Portal User 93','demo_user_093','demo.user.093@dotlife.test','0712000093','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(99,'Demo Portal User 94','demo_user_094','demo.user.094@dotlife.test','0712000094','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(100,'Demo Portal User 95','demo_user_095','demo.user.095@dotlife.test','0712000095','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(101,'Demo Portal User 96','demo_user_096','demo.user.096@dotlife.test','0712000096','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(102,'Demo Portal User 97','demo_user_097','demo.user.097@dotlife.test','0712000097','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(103,'Demo Portal User 98','demo_user_098','demo.user.098@dotlife.test','0712000098','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(104,'Demo Portal User 99','demo_user_099','demo.user.099@dotlife.test','0712000099','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(105,'Demo Portal User 100','demo_user_100','demo.user.100@dotlife.test','0712000100','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(106,'Demo Portal User 101','demo_user_101','demo.user.101@dotlife.test','0712000101','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(107,'Demo Portal User 102','demo_user_102','demo.user.102@dotlife.test','0712000102','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(108,'Demo Portal User 103','demo_user_103','demo.user.103@dotlife.test','0712000103','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(109,'Demo Portal User 104','demo_user_104','demo.user.104@dotlife.test','0712000104','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(110,'Demo Portal User 105','demo_user_105','demo.user.105@dotlife.test','0712000105','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(111,'Demo Portal User 106','demo_user_106','demo.user.106@dotlife.test','0712000106','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(112,'Demo Portal User 107','demo_user_107','demo.user.107@dotlife.test','0712000107','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(113,'Demo Portal User 108','demo_user_108','demo.user.108@dotlife.test','0712000108','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(114,'Demo Portal User 109','demo_user_109','demo.user.109@dotlife.test','0712000109','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(115,'Demo Portal User 110','demo_user_110','demo.user.110@dotlife.test','0712000110','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(116,'Demo Portal User 111','demo_user_111','demo.user.111@dotlife.test','0712000111','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(117,'Demo Portal User 112','demo_user_112','demo.user.112@dotlife.test','0712000112','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(118,'Demo Portal User 113','demo_user_113','demo.user.113@dotlife.test','0712000113','A+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(119,'Demo Portal User 114','demo_user_114','demo.user.114@dotlife.test','0712000114','A-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(120,'Demo Portal User 115','demo_user_115','demo.user.115@dotlife.test','0712000115','B+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(121,'Demo Portal User 116','demo_user_116','demo.user.116@dotlife.test','0712000116','B-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(122,'Demo Portal User 117','demo_user_117','demo.user.117@dotlife.test','0712000117','AB+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(123,'Demo Portal User 118','demo_user_118','demo.user.118@dotlife.test','0712000118','AB-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(124,'Demo Portal User 119','demo_user_119','demo.user.119@dotlife.test','0712000119','O+','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36'),
(125,'Demo Portal User 120','demo_user_120','demo.user.120@dotlife.test','0712000120','O-','$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W','user','Active','2026-09-18 17:16:36','2026-09-18 17:16:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'blood_donor_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-18 18:24:58

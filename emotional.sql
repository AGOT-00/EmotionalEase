
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `emotional`
--

-- --------------------------------------------------------

--
-- Table structure for table `billing`
--

CREATE TABLE `billing` (
  `B_ID` int(11) NOT NULL,
  `U_ID` int(11) NOT NULL,
  `P_ID` int(11) NOT NULL,
  `Date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`B_ID`, `U_ID`, `P_ID`, `Date`) VALUES
(1, 1, 0, '2023-03-25'),
(2, 1, 0, '2023-03-25');

-- --------------------------------------------------------

--
-- Table structure for table `otp_table`
--

CREATE TABLE `otp_table` (
  `email` varchar(50) NOT NULL,
  `OTP` varchar(6) NOT NULL,
  `created_at` timestamp NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_table`
--

INSERT INTO `otp_table` (`email`, `OTP`, `created_at`) VALUES
('talhazulf4163@gmail.com', '111222', '2023-03-25 20:45:02');

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `PId` int(11) NOT NULL,
  `PName` varchar(50) NOT NULL,
  `Chat_Prompt` int(11) NOT NULL,
  `Image_Prompt` int(11) NOT NULL,
  `Price` int(11) NOT NULL,
  `URL` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`PId`, `PName`, `Chat_Prompt`, `Image_Prompt`, `Price`, `URL`) VALUES
(0, 'Free', 5, 0, 0, '/Bot'),
(1, 'Premium', 1000, 50, 10, 'https://buy.stripe.com/test_bIY16j33nbP16Fq000'),
(2, 'Premium Plus', 100000, 10000, 15, 'https://buy.stripe.com/test_dR67uHbzTbP18Ny4gi');

-- --------------------------------------------------------

--
-- Table structure for table `stripepayment`
--

CREATE TABLE `stripepayment` (
  `id` varchar(255) NOT NULL,
  `idempotency` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `Status` int(11) NOT NULL,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stripepayment`
--

INSERT INTO `stripepayment` (`id`, `idempotency`, `email`, `Status`, `amount`) VALUES
('req_2RaptMAYSWQS0V', '71eceadd-708e-4d3f-a56c-3151ab865e10', 'talhazulf4163@gmail.com', 2, 15),
('req_efVFUITVc2w6WJ', 'dca0782e-c4b7-49b7-aaf9-9c637d1980f6', 'talhazulf4163@gmail.com', 2, 10),
('req_f5SGsScXPGU6II', '9dd39424-1f0e-43d0-b6df-35550de69568', 'talhazulf4163@gmail.com', 2, 0),
('req_hJjRWFtDJu9wVk', '313e5696-0830-45a3-9da3-cc5450980fcf', 'talhazulf4163@gmail.com', 2, 0),
('req_jChPRusGX4ifdB', '2a708d7a-7ead-40e7-ae94-e5d6d839f75a', 'talhazulf4163@gmail.com', 2, 15),
('req_prCfNOc4sfUwGX', 'f20fa619-81bc-478a-8a88-cf2682ecce14', 'talhazulf4163@gmail.com', 2, 15),
('req_QeEYvqjT75SD4v', '1746f31c-333a-4414-8959-acd2e8440c08', 'talhazulf4163@gmail.com', 2, 15),
('req_sg8C4PDMybPBkT', 'fc66fd36-d6c4-451e-9815-3c980c49167a', 'talhazulf4163@gmail.com', 2, 0),
('req_t41KeIR3dVDV3N', '88010224-8661-4013-ab50-729bc44dc38a', 'talhazulf4163@gmail.com', 2, 0),
('req_uKVq7wvzR9XCSO', 'd75f2da3-716c-4555-87ae-51ecb2f623c8', 'talhazulf4163@gmail.com', 2, 15);

-- --------------------------------------------------------

--
-- Table structure for table `useable`
--

CREATE TABLE `useable` (
  `UID` int(11) NOT NULL,
  `Prompts` int(11) NOT NULL,
  `Images` int(11) NOT NULL,
  `ResUpdated` date NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `useable`
--

INSERT INTO `useable` (`UID`, `Prompts`, `Images`, `ResUpdated`) VALUES
(1, 9, 10, '2023-03-25'),
(3, 100000, 10000, '2023-03-25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `DOB` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `Name`, `Email`, `Password`, `DOB`) VALUES
(1, 'Muhammad Talha Zulfiqar', 'admin@admin.com', '$2a$08$omxK3SBGi9ca5M8dyfdBQe7Vyg/WiT8MryokAZQW6W2/FoPkHy4Uu', '2009-01-26'),
(3, 'Muhammad Talha Zulfiqar', 'talhazulf4163@gmail.com', '$2a$08$8AdfcBc/CZYIyD5BhTK4Zuq8BcUDBNXr9taZypfjUqeKLivNdzLha', '2006-02-12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`B_ID`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`PId`);

--
-- Indexes for table `stripepayment`
--
ALTER TABLE `stripepayment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idempotency` (`idempotency`);

--
-- Indexes for table `useable`
--
ALTER TABLE `useable`
  ADD PRIMARY KEY (`UID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `B_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `PId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;
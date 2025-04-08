<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = "localhost";
$user = "";
$password = "";
$dbname = "";

$conn = new mysqli($host, $user, $password, $dbname);
if($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
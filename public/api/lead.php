<?php
// Приём заявок MIXER → Telegram школы (и почта, если указана). Spec §7.
// Секреты — НЕ в репозитории: файл lead-config.php лежит уровнем выше папки сайта
// (REG.RU: www/lead-config.php рядом с www/<домен>/) — выкладка его не видит и не стирает.
// Формат lead-config.php:
//   <?php return ['tg_token' => '123:ABC', 'tg_chat' => '-100123', 'email' => '', 'from' => 'noreply@домен'];
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function out($ok, $code = 200, $err = '') { http_response_code($code); echo json_encode(['ok' => $ok, 'error' => $err], JSON_UNESCAPED_UNICODE); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 405, 'method');
if (!empty($_POST['company'])) out(true); // ловушка для ботов: делаем вид, что всё хорошо

$cfgFile = dirname(__DIR__, 2) . '/lead-config.php';
if (!is_file($cfgFile)) out(false, 500, 'config');
$cfg = require $cfgFile;

$clean = function ($k, $max = 120) { return trim(mb_substr(strip_tags((string)($_POST[$k] ?? '')), 0, $max)); };
$name = $clean('name'); $phone = $clean('phone', 40); $tg = $clean('telegram', 64); $email = $clean('email', 120);
$source = $clean('source', 80); $consent = !empty($_POST['consent']);

if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) out(false, 422, 'fields');
if (!$consent) out(false, 422, 'consent');

// Простое ограничение частоты: не больше 5 заявок с одного IP за 10 минут
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$rl = sys_get_temp_dir() . '/mixer-lead-' . md5($ip);
$hits = array_filter(is_file($rl) ? (array)json_decode((string)file_get_contents($rl), true) : [], function ($t) { return $t > time() - 600; });
if (count($hits) >= 5) out(false, 429, 'rate');
$hits[] = time(); @file_put_contents($rl, json_encode(array_values($hits)));

$text = "🎛 Заявка MIXER\n"
  . "Источник: " . ($source ?: 'сайт') . "\n"
  . "Имя: $name\nТелефон: $phone\n"
  . ($tg ? "Telegram: $tg\n" : '')
  . ($email ? "Почта: $email\n" : '')
  . "Согласие на обработку ПДн: да\n"
  . "Время: " . date('d.m.Y H:i', time() + 5 * 3600) . " (Екб)";

$sent = false;
if (!empty($cfg['tg_token']) && !empty($cfg['tg_chat'])) {
  foreach ((array)$cfg['tg_chat'] as $chat) {
    $ch = curl_init('https://api.telegram.org/bot' . $cfg['tg_token'] . '/sendMessage');
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
      CURLOPT_POSTFIELDS => ['chat_id' => $chat, 'text' => $text, 'disable_web_page_preview' => 'true']]);
    $r = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($r !== false && $code === 200) $sent = true;
  }
}
if (!empty($cfg['email'])) {
  $headers = 'From: ' . ($cfg['from'] ?? 'noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost')) . "\r\nContent-Type: text/plain; charset=utf-8";
  if (@mail($cfg['email'], '=?UTF-8?B?' . base64_encode('Заявка MIXER: ' . ($source ?: 'сайт')) . '?=', $text, $headers)) $sent = true;
}
out($sent, $sent ? 200 : 502, $sent ? '' : 'send');

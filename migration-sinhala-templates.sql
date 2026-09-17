-- ============================================================
-- Migration: Sinhala message templates
-- Version: 1.4
-- Safe to re-run: each insert is skipped if that template name
-- already exists.
--
-- These sit alongside the English templates rather than replacing
-- them, so a camp can be announced in either language.
--
-- WhatsApp side: Meta holds one template NAME with a separate
-- approved version per language, so these deliberately reuse the
-- same whatsapp_template_name as their English counterparts and
-- only differ in whatsapp_language ('si'). Each language version
-- still has to be submitted and approved in WhatsApp Manager
-- before it will deliver.
--
-- SMS side: Sinhala forces the carrier into UCS-2, which is 70
-- characters per segment instead of 160. These bodies are short
-- on purpose, but a Sinhala message still costs more segments
-- than the same message in English.
--
-- The {NAME}, {DATE}, {LOCATION}, {BLOOD_GROUP} and {MESSAGE}
-- tokens are matched literally by replacePlaceholders(), so they
-- must stay in Latin capitals inside the Sinhala text.
-- ============================================================

USE `blood_donor_system`;

SET NAMES utf8mb4;

-- ── Camp notification ────────────────────────────────────────
INSERT INTO `message_templates`
    (`template_name`, `template_body`, `template_type`,
     `whatsapp_template_name`, `whatsapp_language`, `whatsapp_variables`)
SELECT * FROM (SELECT
    'Blood Camp Notification (Sinhala)' AS a,
    'ආයුබෝවන් {NAME},\n\nඅපගේ මීළඟ රුධිර දන්දීමේ කඳවුර පහත පරිදි පැවැත්වේ.\n\nදිනය: {DATE}\nස්ථානය: {LOCATION}\n\nඔබගේ සහභාගීත්වය අපි බෙහෙවින් අගය කරමු.\n\nස්තූතියි.' AS b,
    'Camp Notification' AS c,
    'blood_camp_notification' AS d,
    'si' AS e,
    'NAME,DATE,LOCATION' AS f
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `message_templates`
    WHERE `template_name` = 'Blood Camp Notification (Sinhala)'
) LIMIT 1;

-- ── Emergency request ────────────────────────────────────────
INSERT INTO `message_templates`
    (`template_name`, `template_body`, `template_type`,
     `whatsapp_template_name`, `whatsapp_language`, `whatsapp_variables`)
SELECT * FROM (SELECT
    'Emergency Blood Request (Sinhala)' AS a,
    'හදිසි රුධිර අවශ්‍යතාවයකි\n\nරුධිර කාණ්ඩය: {BLOOD_GROUP}\nස්ථානය: {LOCATION}\n\nඔබට රුධිර පරිත්‍යාග කළ හැකි නම්, කරුණාකර වහාම අප හා සම්බන්ධ වන්න.\n\nස්තූතියි.' AS b,
    'Emergency Request' AS c,
    'emergency_blood_request' AS d,
    'si' AS e,
    'BLOOD_GROUP,LOCATION' AS f
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `message_templates`
    WHERE `template_name` = 'Emergency Blood Request (Sinhala)'
) LIMIT 1;

-- ── General announcement ─────────────────────────────────────
INSERT INTO `message_templates`
    (`template_name`, `template_body`, `template_type`,
     `whatsapp_template_name`, `whatsapp_language`, `whatsapp_variables`)
SELECT * FROM (SELECT
    'General Announcement (Sinhala)' AS a,
    'ආයුබෝවන් {NAME},\n\n{MESSAGE}\n\nස්තූතියි.' AS b,
    'General' AS c,
    'general_announcement' AS d,
    'si' AS e,
    'NAME,MESSAGE' AS f
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `message_templates`
    WHERE `template_name` = 'General Announcement (Sinhala)'
) LIMIT 1;

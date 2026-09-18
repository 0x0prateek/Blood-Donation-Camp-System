-- ============================================================
-- Migration: WhatsApp template support
-- Version: 1.2
-- Run ONCE against an existing blood_donor_system database.
--
-- WhatsApp only allows free-form text inside the 24-hour window that
-- opens when a donor messages you first. Announcing a camp to donors
-- who have not written in is "business-initiated" and must use a
-- template that Meta has approved in advance.
--
-- A Meta template body uses numbered variables: {{1}}, {{2}}, {{3}}.
-- This app writes messages with named placeholders ({NAME}, {DATE}...),
-- so each template records which placeholder feeds which number.
-- ============================================================

USE `blood_donor_system`;

ALTER TABLE `message_templates`
    ADD COLUMN `whatsapp_template_name` VARCHAR(255) DEFAULT NULL
        COMMENT 'Exact template name approved in WhatsApp Manager'
        AFTER `template_type`,
    ADD COLUMN `whatsapp_language` VARCHAR(10) NOT NULL DEFAULT 'en'
        COMMENT 'Language code of the approved template, e.g. en, en_US, si'
        AFTER `whatsapp_template_name`,
    ADD COLUMN `whatsapp_variables` VARCHAR(255) DEFAULT NULL
        COMMENT 'Ordered placeholder names feeding {{1}},{{2}},... e.g. NAME,DATE,LOCATION'
        AFTER `whatsapp_language`;

-- Point the shipped templates at the Meta template names an
-- organisation would typically create. These will not send until
-- templates with matching names are approved in WhatsApp Manager.
UPDATE `message_templates`
   SET `whatsapp_template_name` = 'blood_camp_notification',
       `whatsapp_language`      = 'en',
       `whatsapp_variables`     = 'NAME,DATE,LOCATION'
 WHERE `template_type` = 'Camp Notification';

UPDATE `message_templates`
   SET `whatsapp_template_name` = 'emergency_blood_request',
       `whatsapp_language`      = 'en',
       `whatsapp_variables`     = 'BLOOD_GROUP,LOCATION'
 WHERE `template_type` = 'Emergency Request';

UPDATE `message_templates`
   SET `whatsapp_template_name` = 'general_announcement',
       `whatsapp_language`      = 'en',
       `whatsapp_variables`     = 'NAME,MESSAGE'
 WHERE `template_type` = 'General';

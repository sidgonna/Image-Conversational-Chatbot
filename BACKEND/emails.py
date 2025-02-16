    # IMAGE-CONVERSATIONAL-CHATBOT is free software: you can redistribute it and/or modify
    # it under the terms of the GNU General Public License as published by
    # the Free Software Foundation, either version 3 of the License, or
    # (at your option) any later version.

    # IMAGE-CONVERSATIONAL-CHATBOT is distributed in the hope that it will be useful,
    # but WITHOUT ANY WARRANTY; without even the implied warranty of
    # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    # GNU General Public License for more details.

    # You should have received a copy of the GNU General Public License
    # along with IMAGE-CONVERSATIONAL-CHATBOT.  If not, see <https://www.gnu.org/licenses/>.


import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()



# SMTP Configuration
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
MAIL_FROM = os.getenv('MAIL_FROM')
MAIL_PORT = 587
MAIL_SERVER = "smtp.gmail.com"
MAIL_FROM_NAME = "SIH"

def send_email(subject, recipients, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
        msg['To'] = ", ".join(recipients)
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, recipients, msg.as_string())

    except Exception as e:
        print(f"Error sending email: {e}")

async def send_verification_code(emails, url):
    body = f"""
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #4a90e2; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Verify Your Account</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up! To complete your registration, please verify your account by clicking the button below:</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                        <td align="center">
                            <a href="{url}" style="display: inline-block; padding: 12px 24px; background-color: #4a90e2; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Verify Account</a>
                        </td>
                    </tr>
                </table>
                <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
                <p style="font-size: 14px; color: #4a90e2; word-break: break-all; margin-bottom: 20px;">{url}</p>
                <p style="font-size: 14px; color: #666666; margin-bottom: 0;">Note: This verification link will expire in 10 minutes.</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                <p style="font-size: 14px; color: #666666; margin: 0;">If you didn't request this verification, please ignore this email.</p>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    send_email("Verify your Account", emails, body)

async def send_reset_code(emails, url):
    body = f"""
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #e74c3c; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Reset Your Password</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email. Otherwise, click the button below to reset your password:</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                        <td align="center">
                            <a href="{url}" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Reset Password</a>
                        </td>
                    </tr>
                </table>
                <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
                <p style="font-size: 14px; color: #e74c3c; word-break: break-all; margin-bottom: 20px;">{url}</p>
                <p style="font-size: 14px; color: #666666; margin-bottom: 0;">Note: This password reset link will expire in 10 minutes.</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                <p style="font-size: 14px; color: #666666; margin: 0;">If you didn't request a password reset, please contact our support team immediately.</p>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    send_email("Reset your password", emails, body)

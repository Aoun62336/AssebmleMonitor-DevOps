import smtplib
from email.message import EmailMessage
import logging
import asyncio

from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_reset_password_email(email_to: str, token: str) -> bool:
    """Send a password reset email."""
    if not settings.SMTP_HOST or not settings.SMTP_PORT or not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.error("SMTP configuration is incomplete. Cannot send email.")
        return False

    reset_link = f"{settings.FRONTEND_URL}/reset-password.html?token={token}"

    msg = EmailMessage()
    msg['Subject'] = 'AssembleMonitor Password Reset'
    msg['From'] = settings.SMTP_USER
    msg['To'] = email_to

    msg.set_content(
        f"You requested a password reset for your AssembleMonitor account.\n\n"
        f"Please click the following link to reset your password:\n"
        f"{reset_link}\n\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"This link will expire in 1 hour."
    )

    msg.add_alternative(
        f"""
        <html>
            <body>
                <p>You requested a password reset for your AssembleMonitor account.</p>
                <p>Please click the button below to reset your password:</p>
                <p><a href="{reset_link}" style="display:inline-block;padding:10px 20px;color:white;background-color:#007bff;text-decoration:none;border-radius:5px;">Reset Password</a></p>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="{reset_link}">{reset_link}</a></p>
                <p><small>If you did not request this, please ignore this email. This link will expire in 1 hour.</small></p>
            </body>
        </html>
        """,
        subtype='html'
    )

    try:
        # Run synchronous SMTP code in a thread pool to avoid blocking the async event loop
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_email_sync, msg)
        logger.info(f"Password reset email sent successfully to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False

def _send_email_sync(msg: EmailMessage) -> None:
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)  # type: ignore
        server.send_message(msg)

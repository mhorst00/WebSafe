import logging
import smtplib

from decouple import config, UndefinedValueError
from email.message import EmailMessage

from app.model import UserInDB
import app.user as u

try:
    SMTP_SERVER = config("SMTP_SERVER")
    SMTP_PORT = config("SMTP_PORT", cast=int)
    MAIL_ADDRESS = config("MAIL_ADDRESS")
    MAIL_PASSWORD = config("MAIL_PASSWORD")
    URI = config("HOST_URI", default="localhost:8000")
    MAIL_UNSET = False
except UndefinedValueError:
    MAIL_UNSET = True


class MailSend:
    CLIENT = None

    @staticmethod
    def initialise():
        if MAIL_UNSET:
            return None
        MailSend.CLIENT = smtplib.SMTP_SSL(host=SMTP_SERVER, port=SMTP_PORT)
        MailSend.CLIENT.ehlo()
        MailSend.CLIENT.login(user=MAIL_ADDRESS, password=MAIL_PASSWORD)

    @staticmethod
    def send_user_delete(user: UserInDB):
        if MAIL_UNSET:
            return None
        del_string = u.add_deletion_string(user)
        msg = EmailMessage()
        msg["Subject"] = f"WebSafe - Deletion of your account ({user.full_name})"
        msg["From"] = MAIL_ADDRESS
        msg["To"] = user.username
        msg.set_content(
            f"""Hello {user.full_name}, \nyou have requested to delete your account. This
             may be because you have forgotten your password.\n Click this link to
             confirm your account deletion:
             https://{URI}/api/v1/user/delete/verify/{del_string}"""
        )
        try:
            MailSend.CLIENT.send_message(msg)
        except Exception as e:
            logging.error(e)

    @staticmethod
    def send_user_greeting(user: UserInDB):
        if MAIL_UNSET:
            return None
        msg = EmailMessage()
        msg["Subject"] = f"WebSafe - Creation of your account ({user.full_name})"
        msg["From"] = f"noreply@{URI}"
        msg["To"] = user.username
        msg.set_content(
            f"""Hello {user.full_name}, \n
        your account creation has been successful. \n
        Click this link to login to your new account: https://{URI}"""
        )
        try:
            MailSend.CLIENT.send_message(msg)
        except Exception as e:
            logging.error(e)

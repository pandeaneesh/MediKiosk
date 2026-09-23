import smtplib
import os
import threading
from email.message import EmailMessage

PRIMARY_AUTH_EMAIL = "pratikgorade826@gmail.com"
FALLBACK_AUTH_EMAIL = "medikiosk31@gmail.com"
APP_PASSWORD = "iwxadryzithmhztw"

def _dispatch_smtp_email(msg: EmailMessage) -> bool:
    """Attempts SMTP SSL transmission with valid credentials and a 10s timeout."""
    for auth_email in [PRIMARY_AUTH_EMAIL, FALLBACK_AUTH_EMAIL]:
        try:
            if 'From' in msg:
                del msg['From']
            msg['From'] = f"MediKiosk <{auth_email}>"
            
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as smtp:
                smtp.login(auth_email, APP_PASSWORD)
                smtp.send_message(msg)
            print(f"[Email Service SUCCESS] Email dispatched via SMTP (Auth: {auth_email}) -> {msg['To']}")
            return True
        except Exception as err:
            print(f"[Email Service Note] SMTP auth with {auth_email} note: {err}")
    return False

def dispatch_email_async(msg: EmailMessage):
    """Fires SMTP dispatch in background thread so HTTP response never blocks."""
    t = threading.Thread(target=_dispatch_smtp_email, args=(msg,), daemon=True)
    t.start()

class MediKioskEmailService:
    @staticmethod
    def send_verification_code(receiver_email: str, patient_name: str, code: str) -> bool:
        if not receiver_email or "@" not in receiver_email:
            print(f"[Email Service] Skipping email - Invalid email: {receiver_email}")
            return False

        msg = EmailMessage()
        msg['Subject'] = 'MediKiosk ABDM 2.0 - Email Security Verification Code'
        msg['To'] = receiver_email.strip()

        plain_content = f"""
Hello {patient_name},

Your MediKiosk OPD Registration Email Verification Code is: {code}

This code is valid for 5 minutes. Please enter this code on the kiosk screen to verify your registration and print your OPD Token.

Thank you,
MediKiosk ABDM 2.0 National Healthcare Kiosk (medikiosk31@gmail.com)
"""
        msg.set_content(plain_content)

        html_content = f"""\
<html>
  <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;">
    <div style="max-width: 580px; margin: auto; background: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background: #e0f2fe; color: #0284c7; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 800; tracking: 1px;">MEDIKIOSK ABDM 2.0 VERIFICATION</span>
        <h2 style="color: #0f172a; margin-top: 15px; font-size: 24px; font-weight: 900;">Email Security Verification Code</h2>
      </div>
      <p style="color: #334155; font-size: 14px;">Hello <b>{patient_name}</b>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Welcome to <b>MediKiosk</b>. To complete your new patient registration and obtain your OPD Queue Token, please enter the 6-digit security code below on the kiosk screen:
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <div style="display: inline-block; background: #0284c7; color: #ffffff; padding: 14px 28px; border-radius: 14px; font-size: 28px; font-weight: 900; letter-spacing: 6px; font-family: monospace; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
          {code}
        </div>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center;">⏱️ This verification code is valid for <b>5 minutes</b>.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">
        Ayushman Bharat Digital Health Account (ABDM) • Digital Personal Data Protection Act 2023 Compliant<br/>
        This is an automated security message from MediKiosk Central Hub (medikiosk31@gmail.com).
      </p>
    </div>
  </body>
</html>
"""
        msg.add_alternative(html_content, subtype='html')
        dispatch_email_async(msg)
        return True

    @staticmethod
    def send_opd_token_email(receiver_email: str, patient_name: str, ticket_data: dict, pdf_path: str = None) -> bool:
        if not receiver_email or "@" not in receiver_email:
            print(f"[Email Service] Skipping token email - Invalid email: {receiver_email}")
            return False

        ticket_id = ticket_data.get("ticketId", "MED-0000")
        token_num = ticket_data.get("tokenNumber", "00")
        doctor_name = ticket_data.get("doctorName", "Duty Doctor")
        dept = ticket_data.get("department", "General OPD")
        room = ticket_data.get("roomNumber", "OPD Room")
        est_wait = ticket_data.get("estimatedWaitMinutes", 10)
        kiosk_id = ticket_data.get("kioskId", "K-01")
        issued_at = ticket_data.get("issuedAt", "")

        msg = EmailMessage()
        msg['Subject'] = f'MediKiosk OPD Confirmation Token #{token_num} - {patient_name}'
        msg['To'] = receiver_email.strip()

        plain_content = f"""
Hello {patient_name},

Your OPD Check-in & Token Generation is CONFIRMED.

Ticket Reference: {ticket_id}
Token Number: #{token_num}
Consulting Doctor: {doctor_name} ({dept})
Room/Bay: {room}
Estimated Wait Time: ~{est_wait} Minutes
Kiosk Station: {kiosk_id}
Issued Date/Time: {issued_at}

Please present token #{token_num} at OPD Room {room} when your number is called.
Thank you for choosing MediKiosk (medikiosk31@gmail.com)!
"""
        msg.set_content(plain_content)

        html_content = f"""\
<html>
  <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f0f9ff; padding: 25px; margin: 0;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #bae6fd; box-shadow: 0 15px 35px rgba(2, 132, 199, 0.1);">
      
      <div style="background: linear-gradient(135deg, #0284c7, #0369a1); padding: 20px; border-radius: 18px; color: #ffffff; text-align: center;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 50px;">
          MediKiosk OPD Confirmation Slip
        </span>
        <h1 style="margin: 10px 0 0 0; font-size: 36px; font-weight: 900; letter-spacing: 2px;">
          TOKEN #{token_num}
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Ticket ID: <b>{ticket_id}</b></p>
      </div>

      <div style="padding: 20px 0;">
        <p style="color: #0f172a; font-size: 15px; font-weight: 700; margin-bottom: 15px;">
          Dear <b>{patient_name}</b>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Your OPD registration is <b>CONFIRMED</b>. Below are your consultation room and token details:
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Consulting Doctor:</td>
              <td style="padding: 10px 0; font-weight: 800; color: #0284c7; text-align: right;">{doctor_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Department:</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right;">{dept}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Room / Bay Number:</td>
              <td style="padding: 10px 0; font-weight: 800; color: #16a34a; text-align: right;">{room}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Estimated Waiting Time:</td>
              <td style="padding: 10px 0; font-weight: 800; color: #ea580c; text-align: right;">~{est_wait} Minutes</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Kiosk Station:</td>
              <td style="padding: 10px 0; font-weight: 700; color: #475569; text-align: right;">{kiosk_id}</td>
            </tr>
          </table>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 15px; text-align: center; color: #065f46; font-size: 13px; font-weight: 600;">
          💡 Please arrive at <b>{room}</b> when your token number #{token_num} is announced on the hallway digital screen.
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0 20px 0;" />
      
      <div style="text-align: center; font-size: 11px; color: #94a3b8;">
        Sent via <b>MediKiosk Automated Health Notification Network</b> (medikiosk31@gmail.com)<br/>
        ABDM 2.0 Certified • National Health Authority Platform
      </div>

    </div>
  </body>
</html>
"""
        msg.add_alternative(html_content, subtype='html')

        if pdf_path and os.path.exists(pdf_path):
            try:
                with open(pdf_path, 'rb') as f:
                    msg.add_attachment(
                        f.read(),
                        maintype='application',
                        subtype='pdf',
                        filename=os.path.basename(pdf_path)
                    )
            except Exception as err:
                print(f"[Email Service WARNING] Could not attach PDF: {err}")

        dispatch_email_async(msg)
        return True

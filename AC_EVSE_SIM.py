import os
import ssl
import json
import tempfile
import atexit
import customtkinter as ctk
from tkinter import messagebox
import paho.mqtt.client as mqtt

# # ==========================================================
# # CERTIFICATE & BROKER CONFIGURATION
# # ==========================================================
# BROKER_HOST = "your-aws-iot-endpoint.amazonaws.com"
# BROKER_PORT = 8883

# CA_CERT_DATA = """-----BEGIN CERTIFICATE-----
# ... YOUR CA CERT ...
# -----END CERTIFICATE-----"""

# CLIENT_CERT_DATA = """-----BEGIN CERTIFICATE-----
# ... YOUR CLIENT CERT ...
# -----END CERTIFICATE-----"""

# CLIENT_KEY_DATA = """-----BEGIN RSA PRIVATE KEY-----
# ... YOUR PRIVATE KEY ...
# -----END RSA PRIVATE KEY-----"""


# ========== CONFIG ==========
# BROKER_HOST = "broker.philbrickindia.com"
BROKER_HOST = "broker.philbrickindia.com"
BROKER_PORT = 8883

CA_CERT_DATA = """-----BEGIN CERTIFICATE-----
MIIDnTCCAoWgAwIBAgIUZRW/q/wPpeNausc7BLv8dZfnQ80wDQYJKoZIhvcNAQEL
BQAwXjELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEXMBUGA1UEAwwOcGhpbGJyaWNrY2xv
dWQwHhcNMjUwODIwMDUxNzAwWhcNMzUwODE4MDUxNzAwWjBeMQswCQYDVQQGEwJB
VTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0
cyBQdHkgTHRkMRcwFQYDVQQDDA5waGlsYnJpY2tjbG91ZDCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAJiIkKoDCCUsjIiL9fo2qaulW7JnJ3qtSP+eaZko
RhoxmF1LZXcTg0InEJ/fpWziHNdAvmMDI/MEpgqJRyiLDVcgfIDxipg5adufuPht
HxqugJuiJV7kz8OpMRRcg8sMoatcwLfuNtQ09vCfduMN2fjBu0KyGIqsWF5KOajI
Ib8JjTgH9Vrwss/Qp2rZW8xLd4wVGWaSHSOql86ZzhTahxoyGOe4jMABgcVcj7/Q
HpymBZH1IJ3nO6hOdswi30xYd1BsKglSlTfb6HtSB13dg5h6Q+bYCQK6g0c+4wF6
nNiUN0n6cDkvgO3rAJNBcr2Qm9O1wvm/mJhgGptqBx60EsUCAwEAAaNTMFEwHQYD
VR0OBBYEFBjTuLCebVzkPaFvylKp0ER4KA+8MB8GA1UdIwQYMBaAFBjTuLCebVzk
PaFvylKp0ER4KA+8MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEB
AIZnpG7NxPYS+OolLmC8t5H5uN8REb38SObmF0orC7ra6LDsr2vUsBEKSFfstxyi
4ZOEyGzvXkhyvGtlDDk66dDBmACB2ASujNDdRsKN1VSmvO0C7SNxDjguiRoGkaGp
ZYXf7e9aV2KuarXyJiGjaKjdnUi+6gBntuZXmdhEj6MyhGl7IOYWG7wAS5l2Td1w
AELZJKCeiVX3+c5jwolCURU4K/nNmdn2RlG1lvLU4JIfZUM1HSodbGuCKmHVmKrI
fa0dx+FkqWq83uJOYNkAk5JPd0ReUUJawBEw0CFtH/ZPmlI+5TNnKCHTsq3NBE6o
ptwbgQKDIH2LitzEz5G9HQA=
-----END CERTIFICATE-----
"""

CLIENT_CERT_DATA = """-----BEGIN CERTIFICATE-----
MIIDOzCCAiMCFB1CZhZCvhzAa+HDTsfQ/zX1YWSQMA0GCSqGSIb3DQEBCwUAMF4x
CzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl
cm5ldCBXaWRnaXRzIFB0eSBMdGQxFzAVBgNVBAMMDnBoaWxicmlja2Nsb3VkMB4X
DTI1MDgyMDA1MTgyOFoXDTM1MDgxODA1MTgyOFowVjELMAkGA1UEBhMCQVUxEzAR
BgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoMGEludGVybmV0IFdpZGdpdHMgUHR5
IEx0ZDEPMA0GA1UEAwwGcmlkZGhpMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwbf2FDPGm1xM2xwceKgi2gate1NkpqA37hgTgNt8ZppbKLjT5IKt8C3w
ddszOMhOXJ0JJeWcDbe2ZGL7KDquQw2/PPhC+9I7HZ/m1PST9CZaY46n3YEnAwsF
RMtiMzF6mK8aD8i9ihRbabny7S0d1smdpRH8+O08mhYV/qCSuS5JX78TldcSAr0F
mIFxw2XScWUqG1D26mzCoo7bB5oVU6KZd/opwpspQd3Uez2DqYu+sm0aRnPkZlCJ
jAVM9nTb5c85JRnop+6feo/14K/Ng5NzFbi4WM/3B+RaglHPvERl5kj2RYIxOiZt
AQrPg9CwvYaidwMZOtmtPfjb9qmq+wIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBa
HDMz9gPkjB2zyLq7AKOUFbosdPa7Y4Go4ilLlSywG08YUekYUhJyar/XlcXHmYqg
lQ+msncjk9ah5MHDn3bGsHTHPPZIQtEVUOLtODPmXzUK14z09Q8CWGyAlzB2aFgY
+mxwSrsdDS6m4tLqQPUjcI7kQbb4LsZBgDRHJSraXzlBGM+7aCxO93PM4hDat2ny
OWNZlb1G5Z7folV3FuTnKIgl/jYuJfXi6LHbMOiI549Y7rRKg56shsaQro9QRLK6
GPeJtUqCJAmL5xuhu3tEiGy9sl4gPuKLj90GDSu/HJhZ+b5baA9FQAdQ4+LMXthC
yZBKrRA8nF7i75Tj19da
-----END CERTIFICATE-----
"""

CLIENT_KEY_DATA = """-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBt/YUM8abXEzb
HBx4qCLaBq17U2SmoDfuGBOA23xmmlsouNPkgq3wLfB12zM4yE5cnQkl5ZwNt7Zk
YvsoOq5DDb88+EL70jsdn+bU9JP0JlpjjqfdgScDCwVEy2IzMXqYrxoPyL2KFFtp
ufLtLR3WyZ2lEfz47TyaFhX+oJK5LklfvxOV1xICvQWYgXHDZdJxZSobUPbqbMKi
jtsHmhVTopl3+inCmylB3dR7PYOpi76ybRpGc+RmUImMBUz2dNvlzzklGein7p96
j/Xgr82Dk3MVuLhYz/cH5FqCUc+8RGXmSPZFgjE6Jm0BCs+D0LC9hqJ3Axk62a09
+Nv2qar7AgMBAAECggEAHVOdv+I0u3lmMzeWwddma05efhCaaLVRskxXy4au1xOg
IFKW1X3JGlbCE/2KzBpa7p9hbqjLjrIUvS7U6fq0Pfd7T54f+eKSS4JVHkEmkuwp
e+/xTtHKF6ZX9lm59JkVf77meaRAuYIqcp+RfMF7RnSAVqiZ/Q9hQMx+KO2jOMBb
IcJJabIxvcnKh/BzZZf++BwIkSLMFuIvDsAXYknQ1LsJPXg5uO1FAYs45bUACMxr
AiQ93qtbc48f+/5XX9DXu8ltqxtlGEA5xWwEENYSO26/MI74pjDw5YCDM944h9fG
6eep7nQgGWEorD/ct5u+yFromUK+eAWvDXVhqZhuVQKBgQDU8vzG54u38xOFQQx1
P7dpltjzMnq5yS+pkTLTEknlmnpxFeOfJsZM5Ji3lVOGz2GubYNHBOCuqQ8J1vUB
iFlYDvfk20D70vCPVgXXD/SBybUonZ5EAyY4NT/ScR9tQ+D3/EZVzX+92ztGs1JW
NxIYPo41P0yw9B6SVJ/IwlBBnwKBgQDo4bYNQjRm7Jh578hluR8ColmFVP3kOPUB
0kgEiuKtZLVjhb+BJe1MK+36rD96bO4xl3ZR3x6a5nyCF0kaNSsmavGPBu1D5iFF
IyoinLXMUB37OL2zqayBBvWwKtwDYt/Al/thas9i1Mp02VMLfCHB+JKpnfWNmxAE
9nhiH0dxJQKBgARsG2XCDzu9t40P4cNZlGSD9nNue+/5xpyd4FFT0ucKwzov+y8l
7f5QzP8bAcYN7nhh29UQu93EswRAS4xBmaFjhjBhgUL5iXdgkPR7Z1d+qd1zEINX
EWcfa/jh0oZBX52mxosnnlyB/gQk2zPhJuYL/oYKj3wpRa1CRqMzrdj/AoGAZ+yB
z3zh4aRnjtLAfRSVkBlfFa8N9hCs1Xk/hjdsXLB6ecUv5rREJx/bfWfsk/eUfDD5
LiQBhmKg4XT+vGFJtkU3MvqGWyyRYEcHAJcqUdjW6Esz7L8lKhcvAMS/lgtDirDI
D3sYvSP0jRyGgLOOZP9Gg8bn05+FEJHkuvT2brkCgYAwK90CBTGSSHQJ33kjQtVZ
Fu9wQo8irdSNdLIcod1k5hdaXsNUK8q521/Cg1R9ZdX52Y2UGXc8lTVX+9fwDb9X
JufcRkkUxqhhQOleEPHKqIOhbzJGo8kBc/Bga4XSnzZBhkcCBoVQ5+4I1aIlpTCT
ptP4NnG9ONDPqg+Su4ugkw==
-----END PRIVATE KEY-----
"""


temp_files = []

def write_temp_cert(data, suffix):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(data.encode())
    tmp.close()
    temp_files.append(tmp.name)
    return tmp.name

def cleanup():
    for path in temp_files:
        try:
            if path and os.path.exists(path):
                os.unlink(path)
        except Exception as e:
            print(f"Cleanup warning for {path}: {e}")

# ==========================
# MODERN EVSE SIMULATOR UI
# ==========================
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class ModernEVSESimulator:
    def __init__(self, root):
        self.root = root
        self.root.title("EVSE Simulator Dashboard")
        self.root.geometry("1300x950")
        self.root.minsize(1100, 750)

        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)

        # MQTT State Configuration
        self.mqtt_client = mqtt.Client()
        self.is_connected = False
        self.current_device_id = ""
        self.control_widgets = []
        
        # State tracking for Event-Driven updates
        self.last_status = None
        self.last_info = None
        self.last_error = None

        self.cp_states = [
            "NOT_CONNECTED", "PLUGGED_IN", "VENTILATION_REQUIRED",
            "WAITING_FOR_AUTHENTICATION", "CHARGING_ERROR", 
            "CHARGING_IN_PROGRESS", "CHARGING_FINISHED", "EMERGENCY_STOP"
        ]

        self.error_definitions = {
            0: "Over Voltage (Red)", 1: "Under Voltage (Red)", 2: "Over Current (Red)",
            3: "Over Temperature", 4: "SCD Trip Triggered", 5: "Earth Fault Triggered",
            6: "Earth Presence", 7: "Over Voltage (Blue)", 8: "Over Voltage (Yellow)",
            9: "Over Current (Blue)", 10: "Over Current (Yellow)", 11: "Under Voltage (Blue)",
            12: "Under Voltage (Yellow)", 13: "Emergency STOP", 14: "RCD Test Failed"
        }
        self.error_switches = {}

        self.build_sidebar()
        self.build_main_view()
        self.disable_controls()

    # ==========================================================
    # LAYOUT ARCHITECTURE
    # ==========================================================
    def build_sidebar(self):
        sidebar = ctk.CTkFrame(self.root, width=280, corner_radius=0)
        sidebar.grid(row=0, column=0, sticky="nsew")
        sidebar.grid_rowconfigure(4, weight=1)

        ctk.CTkLabel(sidebar, text="⚡ EVSE Sim", font=("Segoe UI", 28, "bold")).grid(row=0, column=0, padx=20, pady=(30, 30))
        ctk.CTkLabel(sidebar, text="CONNECTION", font=("Segoe UI", 12, "bold"), text_color="gray60").grid(row=1, column=0, sticky="w", padx=25, pady=(0, 5))

        self.device_id_entry = ctk.CTkEntry(sidebar, placeholder_text="Enter Device ID", height=40, font=("Segoe UI", 14))
        self.device_id_entry.grid(row=2, column=0, padx=20, pady=10, sticky="ew")

        self.connect_btn = ctk.CTkButton(sidebar, text="Connect MQTT", height=45, font=("Segoe UI", 15, "bold"), command=self.connect_mqtt)
        self.connect_btn.grid(row=3, column=0, padx=20, pady=10, sticky="ew")

        status_frame = ctk.CTkFrame(sidebar, fg_color="transparent")
        status_frame.grid(row=5, column=0, padx=20, pady=30, sticky="ew")
        
        ctk.CTkLabel(status_frame, text="Status:", font=("Segoe UI", 14)).pack(side="left")
        self.status_lbl = ctk.CTkLabel(status_frame, text="Disconnected", text_color="#ff4a4a", font=("Segoe UI", 14, "bold"))
        self.status_lbl.pack(side="right")

    def build_main_view(self):
        main_view = ctk.CTkScrollableFrame(self.root, corner_radius=0, fg_color="transparent")
        main_view.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)

        ctk.CTkLabel(main_view, text="System Overview", font=("Segoe UI", 24, "bold")).pack(anchor="w", padx=20, pady=(20, 10))

        self.create_system_config_card(main_view)
        self.create_telemetry_card(main_view)
        self.create_electrical_card(main_view)
        self.create_error_card(main_view)

    def create_system_config_card(self, parent):
        content = self.create_card_container(parent, "⚙️ System Configuration")
        content.columnconfigure((0, 1, 2), weight=1)

        self.firmware = self.add_labeled_entry(content, "SW_2 Version", 0, 0)
        self.firmware.insert(0, "1.0")
        self.sw2 = self.add_labeled_entry(content, "SW_1 Version", 0, 1)
        self.sw2.insert(0, "1.0")

        cap_frame = ctk.CTkFrame(content, fg_color="transparent")
        cap_frame.grid(row=0, column=2, padx=10, pady=10, sticky="ew")
        ctk.CTkLabel(cap_frame, text="Capacity (kW)", font=("Segoe UI", 13)).pack(anchor="w", pady=(0, 5))
        self.capacity = ctk.CTkSegmentedButton(cap_frame, values=["3.3", "7.2", "11", "22"], height=35, command=self.on_data_change)
        self.capacity.pack(fill="x")
        self.capacity.set("7.2")
        self.control_widgets.append(self.capacity)

    def create_telemetry_card(self, parent):
        content = self.create_card_container(parent, "📊 Charging Telemetry")
        content.columnconfigure((0, 1, 2, 3), weight=1)

        cp_frame = ctk.CTkFrame(content, fg_color="transparent")
        cp_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        ctk.CTkLabel(cp_frame, text="CP Status", font=("Segoe UI", 13)).pack(anchor="w", pady=(0, 5))
        
        self.cp_status = ctk.CTkOptionMenu(cp_frame, values=self.cp_states, height=35, dynamic_resizing=False, command=self.on_data_change)
        self.cp_status.pack(fill="x")
        self.cp_status.set("NOT_CONNECTED")
        self.control_widgets.append(self.cp_status)

        self.temperature = self.add_labeled_entry(content, "Temperature (°C)", 0, 1)
        self.setcurrentfb = self.add_labeled_entry(content, "Set Current FB (A)", 0, 2)

        auth_frame = ctk.CTkFrame(content, fg_color="transparent")
        auth_frame.grid(row=0, column=3, padx=10, pady=10, sticky="ew")
        ctk.CTkLabel(auth_frame, text="Authorization", font=("Segoe UI", 13)).pack(anchor="w", pady=(0, 10))
        self.auth_switch = ctk.CTkSwitch(auth_frame, text="Authorized", font=("Segoe UI", 13, "bold"), command=self.on_data_change)
        self.auth_switch.pack(anchor="w")
        self.control_widgets.append(self.auth_switch)

    def create_electrical_card(self, parent):
        content = self.create_card_container(parent, "⚡ Electrical Data (3-Phase)")
        content.columnconfigure((0, 1, 2), weight=1)
        
        headers = ["Phase", "Voltage (V)", "Current (A)"]
        for col, text in enumerate(headers):
            ctk.CTkLabel(content, text=text, font=("Segoe UI", 14, "bold"), text_color="gray60").grid(row=0, column=col, pady=(0, 10))

        self.voltageR, self.currentR = self.add_phase_row(content, "R-Phase (L1)", 1)
        self.voltageY, self.currentY = self.add_phase_row(content, "Y-Phase (L2)", 2)
        self.voltageB, self.currentB = self.add_phase_row(content, "B-Phase (L3)", 3)

        separator = ctk.CTkFrame(content, height=2, fg_color="gray30")
        separator.grid(row=4, column=0, columnspan=3, sticky="ew", pady=20)

        power_frame = ctk.CTkFrame(content, fg_color="transparent")
        power_frame.grid(row=5, column=0, columnspan=3, sticky="ew")
        power_frame.columnconfigure(0, weight=1)
        self.power = self.add_labeled_entry(power_frame, "Total Active Power (W)", 0, 0, width=250)

    def create_error_card(self, parent):
        content = self.create_card_container(parent, "🚨 Hardware Fault Simulation (Bitwise Toggles)")
        for i in range(3): content.columnconfigure(i, weight=1)

        row_idx, col_idx = 0, 0
        for bit_index, error_name in self.error_definitions.items():
            switch = ctk.CTkSwitch(content, text=f"[Bit {bit_index}] {error_name}", font=("Segoe UI", 13), command=self.on_data_change)
            switch.grid(row=row_idx, column=col_idx, sticky="w", padx=10, pady=10)
            self.error_switches[bit_index] = switch
            self.control_widgets.append(switch)

            col_idx += 1
            if col_idx > 2:
                col_idx = 0; row_idx += 1

    # ==========================================================
    # HELPER UI CONSTRUCTORS (WITH EVENT BINDINGS)
    # ==========================================================
    def create_card_container(self, parent, title):
        card = ctk.CTkFrame(parent, corner_radius=12, fg_color=("gray85", "gray13"))
        card.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(card, text=title, font=("Segoe UI", 18, "bold")).pack(anchor="w", padx=20, pady=(15, 5))
        content = ctk.CTkFrame(card, fg_color="transparent")
        content.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        return content

    def add_labeled_entry(self, parent, label_text, row, col, width=None):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.grid(row=row, column=col, padx=10, pady=10, sticky="ew")
        ctk.CTkLabel(frame, text=label_text, font=("Segoe UI", 13)).pack(anchor="w", pady=(0, 5))
        entry = ctk.CTkEntry(frame, height=35)
        if width: entry.configure(width=width)
        entry.pack(fill="x")
        # Bind FocusOut and Return to evaluate data changes on inputs
        entry.bind("<FocusOut>", self.on_data_change)
        entry.bind("<Return>", self.on_data_change)
        self.control_widgets.append(entry)
        return entry

    def add_phase_row(self, parent, phase_name, row):
        ctk.CTkLabel(parent, text=phase_name, font=("Segoe UI", 14)).grid(row=row, column=0, pady=5)
        
        v_entry = ctk.CTkEntry(parent, height=35, justify="center")
        v_entry.grid(row=row, column=1, padx=20, pady=5, sticky="ew")
        v_entry.bind("<FocusOut>", self.on_data_change)
        v_entry.bind("<Return>", self.on_data_change)
        self.control_widgets.append(v_entry)
        
        c_entry = ctk.CTkEntry(parent, height=35, justify="center")
        c_entry.grid(row=row, column=2, padx=20, pady=5, sticky="ew")
        c_entry.bind("<FocusOut>", self.on_data_change)
        c_entry.bind("<Return>", self.on_data_change)
        self.control_widgets.append(c_entry)
        
        return v_entry, c_entry

    # ==========================================================
    # MQTT SSL/TLS ENGINE
    # ==========================================================
    def connect_mqtt(self):
        device = self.device_id_entry.get().strip()
        if not device:
            messagebox.showerror("Device ID Required", "Please enter a valid Device ID.")
            return

        self.current_device_id = device
        
        self.TOPIC_PUB_STATUS = f"{self.current_device_id}/philbrickev/ac/evse/status"
        self.TOPIC_PUB_INFO = f"{self.current_device_id}/philbrickev/ac/phone/responseid"
        self.TOPIC_PUB_ERROR = f"{self.current_device_id}/philbrickev/ac/evse/error"
        self.TOPIC_PUB_START_ACK = f"{self.current_device_id}/philbrickev/ac/evse/ack/remotestart"
        self.TOPIC_PUB_STOP_ACK = f"{self.current_device_id}/philbrickev/ac/evse/ack/remotestop"

        self.TOPIC_SUB_REQ = f"{self.current_device_id}/philbrickev/ac/phone/requestid"
        self.TOPIC_SUB_START_CMD = f"{self.current_device_id}/philbrickev/ac/phone/remotestart"
        self.TOPIC_SUB_STOP_CMD = f"{self.current_device_id}/philbrickev/ac/phone/remotestop"
        self.TOPIC_SUB_CURRENT_CMD = f"{self.current_device_id}/philbrickev/ac/phone/setcurrent"

        self.status_lbl.configure(text="Connecting...", text_color="yellow")
        self.root.update_idletasks()

        try:
            ca_path = write_temp_cert(CA_CERT_DATA, ".crt")
            cert_path = write_temp_cert(CLIENT_CERT_DATA, ".crt")
            key_path = write_temp_cert(CLIENT_KEY_DATA, ".key")

            self.mqtt_client.tls_set(ca_certs=ca_path, certfile=cert_path, keyfile=key_path, tls_version=ssl.PROTOCOL_TLSv1_2)
            self.mqtt_client.on_connect = self.on_connect
            self.mqtt_client.on_disconnect = self.on_disconnect
            self.mqtt_client.on_message = self.on_message

            self.mqtt_client.connect(BROKER_HOST, BROKER_PORT, 60)
            self.mqtt_client.loop_start()

        except Exception as e:
            print(f"[ERROR] Connection failed: {e}")
            self.status_lbl.configure(text="Error", text_color="#ff4a4a")
            messagebox.showerror("Connection Error", f"Failed to connect to Broker:\n{e}")

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.is_connected = True
            self.root.after(0, self.handle_successful_connection)
            client.subscribe(self.TOPIC_SUB_REQ)
            client.subscribe(self.TOPIC_SUB_START_CMD)
            client.subscribe(self.TOPIC_SUB_STOP_CMD)
            client.subscribe(self.TOPIC_SUB_CURRENT_CMD)
        else:
            self.root.after(0, lambda: self.status_lbl.configure(text="Failed", text_color="#ff4a4a"))

    def handle_successful_connection(self):
        self.status_lbl.configure(text="Connected", text_color="#00fa9a") 
        self.connect_btn.configure(text="Disconnect MQTT", fg_color="#C62828", hover_color="#b71c1c")
        self.connect_btn.configure(command=self.disconnect_mqtt)
        self.enable_controls()
        
        # Reset local cache state to force transmission of current baseline parameters
        self.last_status = None
        self.last_info = None
        self.last_error = None
        
        # Trigger immediate payload creation and publication on successful connection
        self.on_data_change()

    def on_disconnect(self, client, userdata, rc):
        self.is_connected = False
        self.root.after(0, self.handle_disconnect_ui)

    def handle_disconnect_ui(self):
        self.status_lbl.configure(text="Disconnected", text_color="#ff4a4a")
        self.connect_btn.configure(text="Connect MQTT", fg_color=["#3B8ED0", "#1F6AA5"], hover_color=["#36719F", "#144870"])
        self.connect_btn.configure(command=self.connect_mqtt)
        self.disable_controls()

    def disconnect_mqtt(self):
        if self.is_connected:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

    def on_message(self, client, userdata, msg):
        payload = msg.payload.decode(errors="ignore").strip()
        print(f"[RX] {msg.topic}: {payload}")
        if msg.topic == self.TOPIC_SUB_REQ:
            print(f"[ACTION] Data Request Event. Transmitting metadata to {self.TOPIC_PUB_INFO}")
            
            # Force generating and publishing info frame bypassing the event logic
            info_payload = self.build_info_payload()
            self.mqtt_client.publish(self.TOPIC_PUB_INFO, info_payload)
            self.last_info = info_payload
            print(f"[TX INFO] {self.TOPIC_PUB_INFO} -> {info_payload}")
        elif msg.topic == self.TOPIC_SUB_START_CMD:
            print(f"[ACTION] Remote Start Command Received. Sending ACK to {self.TOPIC_PUB_START_ACK}")
            ack_payload = json.dumps({"ack": "START OK"})
            self.mqtt_client.publish(self.TOPIC_PUB_START_ACK, ack_payload)
            print(f"[TX START ACK] {self.TOPIC_PUB_START_ACK} -> {ack_payload}")
        elif msg.topic == self.TOPIC_SUB_STOP_CMD:
            print(f"[ACTION] Remote Stop Command Received. Sending ACK to {self.TOPIC_PUB_STOP_ACK}")
            ack_payload = json.dumps({"ack": "STOP OK"})
            self.mqtt_client.publish(self.TOPIC_PUB_STOP_ACK, ack_payload)
            print(f"[TX STOP ACK] {self.TOPIC_PUB_STOP_ACK} -> {ack_payload}")
        elif msg.topic == self.TOPIC_SUB_CURRENT_CMD:
            try:
                data = json.loads(payload)
                new_current = data.get("setcurrent", None)
                if new_current is not None:
                    self.setcurrentfb.delete(0, tk.END)
                    self.setcurrentfb.insert(0, str(new_current))
                    print(f"[ACTION] Set Current Command Received. Updated setcurrentfb to {new_current}A")
                    self.on_data_change()  # Trigger data change to publish updated status
            except json.JSONDecodeError:
                print(f"[ERROR] Invalid JSON payload for set current command: {payload}")

    # ==========================================================
    # DATA PARSING & PUBLISH PATTERN
    # ==========================================================
    def safe_float(self, entry_widget):
        try:
            return round(float(entry_widget.get().strip()) * 10.0) / 10.0
        except (ValueError, TypeError):
            return 0.0

    def calculate_error_bitmask(self):
        error_code = 0
        for bit_index, switch in self.error_switches.items():
            if switch.get() == 1:
                error_code |= (1 << bit_index) 
        return error_code

    # --- Payload Builders ---
    def build_status_payload(self):
        try:
            cp_stat_idx = self.cp_states.index(self.cp_status.get())
        except ValueError:
            cp_stat_idx = 0

        doc = {
            "cp_stat": cp_stat_idx,
            "voltageR": self.safe_float(self.voltageR),
            "voltageY": self.safe_float(self.voltageY),
            "voltageB": self.safe_float(self.voltageB),
            "currentR": self.safe_float(self.currentR),
            "currentY": self.safe_float(self.currentY),
            "currentB": self.safe_float(self.currentB),
            "power": self.safe_float(self.power),
            "temperature": self.safe_float(self.temperature),
            "setcurrentfb": self.safe_float(self.setcurrentfb),
            "auth": int(self.auth_switch.get())
        }
        return json.dumps(doc)

    def build_info_payload(self):
        capacity_map = {"3.3": 0, "7.2": 1, "11": 2, "22": 3}
        doc = {
            "device1": self.current_device_id,
            "evsecap": capacity_map.get(self.capacity.get(), 1),
            "swversion1": self.safe_float(self.sw2),
            "swversion2": self.safe_float(self.firmware)
        }
        return json.dumps(doc)

    def build_error_payload(self):
        doc = {
            "error": self.calculate_error_bitmask()
        }
        return json.dumps(doc)

    # --- Event Handler ---
    def on_data_change(self, *args):
        """Monitors all fields. Triggered internally via bindings. Publishes ONLY if the data has mutated."""
        if not self.is_connected:
            return

        # 1. Evaluate Status Frame changes
        current_status = self.build_status_payload()
        if current_status != self.last_status:
            self.mqtt_client.publish(self.TOPIC_PUB_STATUS, current_status)
            print(f"[TX STATUS EVENT] {self.TOPIC_PUB_STATUS} -> {current_status}")
            self.last_status = current_status

        # 2. Evaluate Info Frame changes
        current_info = self.build_info_payload()
        if current_info != self.last_info:
            self.mqtt_client.publish(self.TOPIC_PUB_INFO, current_info)
            print(f"[TX INFO EVENT] {self.TOPIC_PUB_INFO} -> {current_info}")
            self.last_info = current_info

        # 3. Evaluate Error Frame changes
        current_error = self.build_error_payload()
        if current_error != self.last_error:
            self.mqtt_client.publish(self.TOPIC_PUB_ERROR, current_error)
            print(f"[TX ERROR EVENT] {self.TOPIC_PUB_ERROR} -> {current_error}")
            self.last_error = current_error

    # ==========================================================
    # CONTROL WIDGET SYSTEM MUTATION UTILITIES
    # ==========================================================
    def disable_controls(self):
        for widget in self.control_widgets:
            widget.configure(state="disabled")

    def enable_controls(self):
        for widget in self.control_widgets:
            widget.configure(state="normal")

if __name__ == "__main__":
    atexit.register(cleanup)
    root = ctk.CTk()
    app = ModernEVSESimulator(root)
    root.mainloop()
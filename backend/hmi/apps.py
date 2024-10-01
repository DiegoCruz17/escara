from django.apps import AppConfig
from django.conf import settings
from .controlador import global_controlador

class HmiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hmi'

    def ready(self):
        global_controlador.start_serial_listener()
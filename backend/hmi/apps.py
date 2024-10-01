from django.apps import AppConfig
from .controlador import Controlador


class HmiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hmi'

    def ready(self):
        # if not settings.DEBUG:  # Avoid running this in development with auto-reloader
        controlador = Controlador()
        controlador.start_serial_listener()

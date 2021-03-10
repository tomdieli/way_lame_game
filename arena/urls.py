"""
    arena URL Configuration
"""
from django.conf.urls import include
from django.urls import path
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings

from game.views import lobby

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lobby, name='lobby'),
    path('arena/', include('game.urls')),
]

#Add Django site authentication urls (for login, logout, password management)

urlpatterns += [
    path('accounts/', include('django.contrib.auth.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'), 
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('profile/', views.profile_view, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('library/', views.library_view, name='library'),
    path('favorites/', views.favorites_view, name='favorites'),
    path('plans/', views.plans_view, name='plans'),
    
    # التعديل هنا: إضافة الـ id وتغيير الاسم لـ book_detail
    path('book/<int:id>/', views.book_view, name='book_detail'), 
    
    path('add_book/', views.add_book_view, name='add_book'),
    path('about-us/', views.about_us_view, name='about-us'),
    
    # إضافة رابط الـ toggle_favorite عشان الـ JS يشوفه
    path('toggle-favorite/<int:book_id>/', views.toggle_favorite, name='toggle_favorite'),
]
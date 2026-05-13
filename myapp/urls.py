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
    path('select-plan/', views.select_plan, name='select-plan'),
    
    # التعديل هنا: إضافة الـ id وتغيير الاسم لـ book_detail
    path('book/<int:id>/read-pdf/', views.book_read_pdf, name='book_read_pdf'),
    path('book/<int:id>/', views.book_view, name='book_detail'), 
    
    path('add_book/', views.add_book_view, name='add_book'),
    path('about-us/', views.about_us_view, name='about-us'),
    
    # إضافة رابط الـ toggle_favorite عشان الـ JS يشوفه
    path('toggle-favorite/<int:book_id>/', views.toggle_favorite, name='toggle_favorite'),
    
    # إضافة endpoints للـ API
    path('api/user-favorites/', views.get_user_favorites, name='user_favorites'),
    path('api/get-books/', views.get_books, name='get_books'),
    path('api/my-borrows/', views.get_my_borrows, name='my_borrows'),
    path('api/borrow/<int:book_id>/', views.borrow_book_api, name='borrow_book'),
    path('api/return/<int:book_id>/', views.return_book_api, name='return_book'),
]
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout as django_logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Favorite, Book, Author, UserPlan

def home_view(request):
    # جلب البيانات من الداتا بيز
    most_read_books = Book.objects.filter(most_read=True)
    latest_books = Book.objects.filter(latest=True).order_by('-id')[:10]
        # هنجيب بس المؤلفين اللي رفعنا ليهم صور فعلاً
    authors = Author.objects.exclude(image="").exclude(image__isnull=True)[:5]
    
    # جلب الـ IDs للمفضلات لو اليوزر مسجل دخول
    favorite_book_ids = []
    if request.user.is_authenticated:
        favorite_book_ids = Favorite.objects.filter(user=request.user).values_list('book_id', flat=True)
    
    context = {
        'most_read_books': most_read_books,
        'latest_books': latest_books,
        'authors': authors, # بعتنا المؤلفين هنا
        'favorite_book_ids': list(favorite_book_ids),
    }
    return render(request, 'index.html', context)

# Signup View
def signup_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')
        
        if password != confirm_password:
            messages.error(request, "Passwords do not match!")
            return render(request, 'signup.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, "This email is already registered!")
            return render(request, 'signup.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, "This username is already taken.")
            return render(request, 'signup.html')

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            if request.POST.get('admin') == 'on':
                user.is_staff = True
                user.save()
            
            login(request, user)
            messages.success(request, f"Welcome, {username}! Your account has been created.")
            return redirect('profile') 
        except Exception:
            messages.error(request, "An error occurred during registration.")
            return render(request, 'signup.html')

    return render(request, 'signup.html')

# Login View
def login_view(request):
    if request.method == "POST":
        email_input = request.POST.get('email')
        password_input = request.POST.get('password')

        try:
            user_obj = User.objects.get(email=email_input)
            user = authenticate(request, username=user_obj.username, password=password_input)

            if user is not None:
                login(request, user)
                messages.success(request, "Logged in successfully!")
                return redirect('profile')
            else:
                messages.error(request, "Invalid password.")
        except User.DoesNotExist:
            messages.error(request, "No account found with this email.")

    return render(request, 'login.html')

# Profile View
@login_required(login_url='login')
def profile_view(request):
    return render(request, 'profile.html', {'user': request.user})

# Logout View
def logout_view(request):
    django_logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')

def library_view(request):
    all_books = Book.objects.all()
    return render(request, 'library.html', {'books': all_books})

def favorites_view(request):
    if request.user.is_authenticated:
        # بنجيب الكتب اللي اليوزر عملها مفضلة فعلياً
        user_favorites = Favorite.objects.filter(user=request.user).select_related('book')
        books = [fav.book for fav in user_favorites]
    else:
        books = []
    return render(request, 'favorites.html', {'books': books})

@login_required
def plans_view(request):
    # الحصول على خطة اليوزر الحالية (لو مش موجودة بنجيب الـ basic)
    current_plan, created = UserPlan.objects.get_or_create(user=request.user)
    return render(request, 'plans.html', {
        'current_plan': current_plan.plan_name
    })

@login_required
def select_plan(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        new_plan = data.get('plan')
        
        # تحديث الخطة في الداتابيز
        user_plan = request.user.user_plan
        user_plan.plan_name = new_plan
        user_plan.save()
        
        return JsonResponse({'status': 'success', 'message': f'Switched to {new_plan}'})

def book_view(request, id):
    book = get_object_or_404(Book, id=id)
    return render(request, 'book.html', {'book': book})

def add_book_view(request):
    return render(request, 'add_book.html')

def about_us_view(request):
    return render(request, 'about-us.html')

@login_required
def toggle_favorite(request, book_id):
    if request.method == "POST":
        book = get_object_or_404(Book, id=book_id)
        fav, created = Favorite.objects.get_or_create(user=request.user, book=book)
        
        if not created:
            fav.delete()
            status = "removed"
        else:
            status = "added"
            
        return JsonResponse({'status': status})
    return JsonResponse({'error': 'Invalid request'}, status=400)
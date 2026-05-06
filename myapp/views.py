from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout as django_logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

# Home View
def home_view(request):
    return render(request, 'index.html')

# Signup View
def signup_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')
        
        # English Messages
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
            # 1. Get user by email
            user_obj = User.objects.get(email=email_input)
            # 2. Authenticate using the actual username
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

# Profile View (Protected)
@login_required(login_url='login')
def profile_view(request):
    return render(request, 'profile.html', {'user': request.user})

# Logout View
def logout_view(request):
    django_logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')
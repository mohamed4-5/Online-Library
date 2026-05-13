from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout as django_logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse, HttpResponse, HttpResponseForbidden

from .models import Favorite, Book, Author, UserPlan, BorrowedBook
import json
import os

PLAN_BORROW_LIMITS = {
    'basic': 2,
    'standard': 5,
    'premium': 10,
}


def _borrow_slot_payload(user):
    """Current borrow counts for the user's plan (after any DB changes in the same request)."""
    user_plan, _ = UserPlan.objects.get_or_create(user=user)
    limit = PLAN_BORROW_LIMITS.get(user_plan.plan_name, 2)
    borrowed = BorrowedBook.objects.filter(user=user).count()
    remaining = max(0, limit - borrowed)
    return {
        'borrow_limit': limit,
        'borrowed_count': borrowed,
        'remaining': remaining,
    }


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
    plan_name = 'basic'
    if hasattr(request.user, 'user_plan'):
        plan_name = request.user.user_plan.plan_name
    borrow_limit = PLAN_BORROW_LIMITS.get(plan_name, 2)
    context = {
        'user': request.user,
        'current_plan': plan_name,
        'current_plan_label': dict(UserPlan.PLAN_CHOICES).get(plan_name, plan_name),
        'borrow_limit': borrow_limit,
    }
    return render(request, 'profile.html', context)

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
        # Get user's favorite books
        user_favorites = Favorite.objects.filter(user=request.user).select_related('book')
        books = [fav.book for fav in user_favorites]
        favorite_book_ids = [fav.book.id for fav in user_favorites]
        
        context = {
            'books': books,
            'favorite_book_ids': favorite_book_ids,
        }
        return render(request, 'favorites-page.html', context)
    else:
        return redirect('login')

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
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
        new_plan = data.get('plan')
        valid_plans = {c[0] for c in UserPlan.PLAN_CHOICES}
        if new_plan not in valid_plans:
            return JsonResponse({'status': 'error', 'message': 'Invalid plan'}, status=400)
        
        # تحديث الخطة في الداتابيز
        user_plan = request.user.user_plan
        user_plan.plan_name = new_plan
        user_plan.save()
        
        return JsonResponse({'status': 'success', 'message': f'Switched to {new_plan}'})
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def book_view(request, id):
    book = get_object_or_404(Book, id=id)
    
    # جلب جميع الكتب لـ JavaScript (للكتب المرتبطة) — مسارات الصور الكاملة
    books_list = []
    for b in Book.objects.select_related('author').all():
        books_list.append({
            'id': b.id,
            'title': b.title,
            'author': b.author.name,
            'category': b.category,
            'image': b.image.url,
            'description': b.description,
            'rating': float(b.rating),
        })
    
    context = {
        'book': book,
        'books_json': json.dumps(books_list)
    }
    return render(request, 'book.html', context)


@login_required(login_url='login')
def book_read_pdf(request, id):
    """Serve the book PDF only to logged-in users with an active borrow."""
    book = get_object_or_404(Book, id=id)
    if not BorrowedBook.objects.filter(user=request.user, book=book).exists():
        return HttpResponseForbidden("You are not allowed to read this book.")
    if not book.pdf_file or not book.pdf_file.name:
        return HttpResponse("PDF not available", status=404, content_type="text/plain; charset=utf-8")
    if not book.pdf_file.storage.exists(book.pdf_file.name):
        return HttpResponse("File missing", status=404, content_type="text/plain; charset=utf-8")
    try:
        try:
            path = book.pdf_file.path
        except (ValueError, NotImplementedError):
            path = None
        if path and os.path.isfile(path):
            fh = open(path, "rb")
        else:
            fh = book.pdf_file.open("rb")
    except OSError:
        return HttpResponse("File missing", status=404, content_type="text/plain; charset=utf-8")
    resp = FileResponse(fh, as_attachment=False, content_type="application/pdf")
    resp["Content-Disposition"] = "inline"
    return resp

@login_required(login_url='login')
def add_book_view(request):
    """Staff-only POST creates Book + Author. GET: anyone logged in sees form or a staff-only notice."""
    if request.method == 'POST':
        if not request.user.is_staff:
            return JsonResponse({'ok': False, 'error': 'Only staff can add books.'}, status=403)
        title = (request.POST.get('title') or '').strip()[:200]
        author_name = (request.POST.get('author') or '').strip()[:100]
        category = (request.POST.get('category') or '').strip()[:100]
        description = (request.POST.get('description') or '').strip()
        try:
            rating = float(request.POST.get('rating') or 0)
        except (TypeError, ValueError):
            rating = 0.0
        rating = max(0.0, min(5.0, rating))
        latest = request.POST.get('latest') == 'on'
        most_read = request.POST.get('most_read') == 'on'
        cover = request.FILES.get('cover')
        pdf = request.FILES.get('pdf')

        if not all([title, author_name, category, description, cover, pdf]):
            return JsonResponse(
                {
                    'ok': False,
                    'error': 'Please fill all required fields and upload cover + PDF.',
                },
                status=400,
            )

        try:
            author, _ = Author.objects.get_or_create(name=author_name)
            book = Book.objects.create(
                title=title,
                author=author,
                category=category,
                description=description,
                image=cover,
                pdf_file=pdf,
                rating=rating,
                latest=latest,
                most_read=most_read,
            )
        except Exception as exc:
            return JsonResponse(
                {'ok': False, 'error': f'Could not save book: {exc}'},
                status=500,
            )
        return JsonResponse(
            {
                'ok': True,
                'book_id': book.id,
                'message': f'"{book.title}" was added to the library.',
            }
        )

    return render(request, 'add_book.html')

def about_us_view(request):
    return render(request, 'about-us.html')

def toggle_favorite(request, book_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'auth', 'status': 'login_required'}, status=401)
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

def get_user_favorites(request):
    """Returns list of favorite book IDs for the current user"""
    if request.user.is_authenticated:
        favorite_ids = Favorite.objects.filter(user=request.user).values_list('book_id', flat=True)
        return JsonResponse({'favorites': list(favorite_ids)})
    return JsonResponse({'favorites': []})

def get_books(request):
    """Returns all books in JSON format for frontend use"""
    books = Book.objects.select_related('author').all()
    books_list = [
        {
            'id': book.id,
            'title': book.title,
            'author': book.author.name,
            'category': book.category,
            'image': book.image.url,
            'description': book.description,
            'rating': float(book.rating),
            'latest': book.latest,
            'most_read': book.most_read,
        }
        for book in books
    ]
    return JsonResponse({'books': books_list})


def get_my_borrows(request):
    if not request.user.is_authenticated:
        return JsonResponse({'borrowed_ids': []})
    ids = list(
        BorrowedBook.objects.filter(user=request.user).values_list('book_id', flat=True)
    )
    return JsonResponse({'borrowed_ids': ids})


def borrow_book_api(request, book_id):
    if not request.user.is_authenticated:
        return JsonResponse({'ok': False, 'msg': 'Please log in to borrow books.'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'msg': 'Invalid method'}, status=400)
    book = get_object_or_404(Book, id=book_id)
    if BorrowedBook.objects.filter(user=request.user, book=book).exists():
        return JsonResponse({
            'ok': True,
            'msg': 'Already borrowed',
            **_borrow_slot_payload(request.user),
        })
    user_plan, _ = UserPlan.objects.get_or_create(user=request.user)
    plan_name = user_plan.plan_name
    limit = PLAN_BORROW_LIMITS.get(plan_name, 2)
    current = BorrowedBook.objects.filter(user=request.user).count()
    if current >= limit:
        return JsonResponse({
            'ok': False,
            'msg': 'Borrow limit reached for your plan. Return a book or choose a higher plan.',
            'needs_plan': True,
            **_borrow_slot_payload(request.user),
        })
    BorrowedBook.objects.create(user=request.user, book=book)
    return JsonResponse({
        'ok': True,
        'msg': 'Book borrowed successfully.',
        **_borrow_slot_payload(request.user),
    })


def return_book_api(request, book_id):
    if not request.user.is_authenticated:
        return JsonResponse({'ok': False, 'msg': 'Please log in.'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'msg': 'Invalid method'}, status=400)
    deleted, _ = BorrowedBook.objects.filter(user=request.user, book_id=book_id).delete()
    if deleted:
        return JsonResponse({
            'ok': True,
            'msg': 'Book returned successfully.',
            **_borrow_slot_payload(request.user),
        })
    return JsonResponse({
        'ok': True,
        'msg': 'Nothing to return.',
        **_borrow_slot_payload(request.user),
    })
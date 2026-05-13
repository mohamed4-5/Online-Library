from django.db import models
from django.contrib.auth.models import User  # استيراد نظام المستخدمين الجاهز

class Author(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # رفع الصور لمجلد authors جوه الميديا
    image = models.ImageField(upload_to='authors/', null=True, blank=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=200)
    # ربط الكتاب بالمؤلف
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    category = models.CharField(max_length=100)
    # رفع أغلفة الكتب لمجلد covers جوه الميديا
    image = models.ImageField(upload_to='covers/')
    description = models.TextField()
    rating = models.FloatField(default=0.0)
    most_read = models.BooleanField(default=False)
    latest = models.BooleanField(default=False)
    # رفع ملفات الـ PDF لمجلد pdfs جوه الميديا
    pdf_file = models.FileField(upload_to='pdfs/')

    def __str__(self):
        return self.title
    
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book') # عشان الكتاب ميتكررش للمستخدم الواحد


class BorrowedBook(models.Model):
    """Active borrow: one row per user per book until returned."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='active_borrows')
    borrowed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.username} → {self.book.title}"


class UserPlan(models.Model):
    # خيارات الخطط المتاحة
    PLAN_CHOICES = [
        ('basic', 'Basic (Free)'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_plan')
    plan_name = models.CharField(max_length=20, choices=PLAN_CHOICES, default='basic')
    start_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan_name}"

# كود تلقائي لإنشاء خطة Basic فور تسجيل أي يوزر جديد
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_plan(sender, instance, created, **kwargs):
    if created:
        UserPlan.objects.create(user=instance)
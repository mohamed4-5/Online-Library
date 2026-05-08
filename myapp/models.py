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
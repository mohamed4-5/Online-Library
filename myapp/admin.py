from django.contrib import admin
from .models import Author, Book, Favorite, UserPlan

# تخصيص عرض الكتب في لوحة الأدمن
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'rating', 'most_read', 'latest')
    list_filter = ('category', 'most_read', 'latest')
    search_fields = ('title', 'author__name')

admin.site.register(Author)
admin.site.register(Book, BookAdmin)
admin.site.register(Favorite)
admin.site.register(UserPlan)
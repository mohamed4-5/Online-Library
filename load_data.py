import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Book, Author

def run():
    # 1. قائمة الصور للمؤلفين اللي "مجهزينهم"
    core_authors_images = {
        "H.G. Wells": "h.g wells.jfif",
        "Mark Twain": "mark twain.webp",
        "William Shakespeare": "william shakespeare.webp",
        "Jack London": "jack london.jfif",
        "Bram Stoker": "bram stoker.jfif"
    }

    # 2. قراءة ملف الـ JSON
    with open('data.json', 'r', encoding='utf-8') as f:
        books_data = json.load(f)

    print("\n--- Starting Full Data Load (14 Books) ---")
    for item in books_data:
        author_name = item['author']
        
        # إنشاء أو جلب المؤلف باسمه الحقيقي (مهما كان)
        author_obj, created = Author.objects.get_or_create(name=author_name)
        
        # لو المؤلف ده واحد من "الخمسة الكبار" بتوعنا، نربط صورته فوراً
        if author_name in core_authors_images and not author_obj.image:
            author_obj.image = f"authors/{core_authors_images[author_name]}"
            author_obj.save()
            print(f"📸 Attached image to core author: {author_name}")

        # معالجة ملفات الكتاب
        image_filename = item['image'].split('/')[-1]
        pdf_filename = item['pdf'].split('/')[-1]

        # إنشاء الكتاب وربطه بمؤلفه الأصلي
        book_obj, book_created = Book.objects.get_or_create(
            title=item['title'],
            defaults={
                'author': author_obj, # المؤلف الحقيقي من الـ JSON
                'category': item['category'],
                'description': item['description'],
                'rating': item['rating'],
                'most_read': item['mostRead'],
                'latest': item['latest'],
                'image': f"covers/{image_filename}",
                'pdf_file': f"pdfs/{pdf_filename}"
            }
        )
        
        if book_created:
            print(f"✅ Success: '{item['title']}' by {author_name}")
        else:
            print(f"🟡 Skip: '{item['title']}' already exists")

    print("\n--- Mission Accomplished: All books loaded correctly! ---")

if __name__ == '__main__':
    run()
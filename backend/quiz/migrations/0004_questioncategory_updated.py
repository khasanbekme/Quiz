# Generated by Django 4.2.1 on 2023-06-09 09:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0003_remove_question_categories_question_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='questioncategory',
            name='updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]

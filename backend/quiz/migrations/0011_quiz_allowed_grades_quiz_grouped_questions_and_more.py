# Generated by Django 4.2.1 on 2023-06-30 13:22

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
        ('quiz', '0010_alter_quiz_duration'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='allowed_grades',
            field=models.ManyToManyField(related_name='open_quizes', to='account.grade'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='grouped_questions',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='QuizQuestionGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('random_questions', models.BooleanField(default=False)),
                ('random_options', models.BooleanField(default=False)),
                ('total_questions', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('point', models.FloatField(default=1.0)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='quiz.questioncategory')),
            ],
        ),
        migrations.AddField(
            model_name='quizinstancequestion',
            name='group',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='quiz.quizquestiongroup'),
        ),
    ]

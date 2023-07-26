# Generated by Django 4.2.3 on 2023-07-26 04:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0018_alter_quiz_options_userattempt_end_time'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='quiz',
            options={'ordering': ('-start_time',)},
        ),
        migrations.RenameField(
            model_name='quizinstancequestion',
            old_name='quiz_instance',
            new_name='user_attempt',
        ),
        migrations.AlterUniqueTogether(
            name='quizinstancequestion',
            unique_together={('user_attempt', 'question')},
        ),
        migrations.AddField(
            model_name='quizinstancequestion',
            name='score',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='userattempt',
            name='started_at',
            field=models.DateTimeField(),
        ),
    ]

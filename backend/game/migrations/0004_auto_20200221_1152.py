# Generated by Django 3.0.3 on 2020-02-21 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_auto_20200221_1148'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='name',
            field=models.CharField(max_length=30, unique=True),
        ),
    ]

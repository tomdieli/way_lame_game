# Generated by Django 3.0.3 on 2020-03-10 07:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_auto_20200221_1152'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='players',
            field=models.ManyToManyField(related_name='players_list', to='game.Figure'),
        ),
    ]
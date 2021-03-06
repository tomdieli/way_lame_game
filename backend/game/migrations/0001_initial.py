# Generated by Django 2.2.2 on 2019-08-06 18:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_round', models.PositiveIntegerField(default=1)),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=25, unique=True)),
                ('equipped', models.BooleanField(default=True)),
                ('damage_dice', models.PositiveIntegerField(default=0)),
                ('damage_mod', models.IntegerField(default=0)),
                ('equip_pts', models.PositiveIntegerField(default=0)),
                ('hit_takes', models.IntegerField(default=0)),
                ('min_st', models.PositiveIntegerField(default=0)),
                ('dx_adj', models.IntegerField(default=0)),
                ('adj_ma', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Figure',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('figure_name', models.CharField(max_length=30)),
                ('strength', models.IntegerField(default=8)),
                ('dexterity', models.IntegerField(default=8)),
                ('hits', models.IntegerField(default=8)),
                ('adjusted_dex', models.IntegerField(default=8)),
                ('movement_allowance', models.IntegerField(default=10)),
                ('adjusted_ma', models.IntegerField(default=10)),
                ('experience', models.IntegerField(default=0)),
                ('engaged', models.BooleanField(default=True)),
                ('dmg_penalty', models.BooleanField(default=False)),
                ('tmp_dx_mod', models.IntegerField(default=0)),
                ('dodging', models.BooleanField(default=False)),
                ('prone', models.BooleanField(default=False)),
                ('facing', models.CharField(max_length=2, null=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.Game')),
                ('items', models.ManyToManyField(related_name='player_items', to='game.Item')),
            ],
        ),
    ]

from django.forms import ModelForm
from django.core.exceptions import ValidationError
from django.db.models import Sum

from .models import Figure

class FigureForm(ModelForm):
    class Meta:
        model = Figure
        fields = ['figure_name', 'strength', 'dexterity', 'items', 'id']


    #called on validation of the form
    def clean(self):
        cleaned_data=super(FigureForm, self).clean()

        # check the proper amount of attribute points.
        st = cleaned_data.get("strength")
        dx = cleaned_data.get("dexterity")
        if st + dx != 24:
            raise ValidationError( 
                'You must have 24 points split between ST and DX: %s + %s = %s'
                % (st, dx, st+dx)
            )

        # check the items list
        items = cleaned_data.get('items')
        slot_info = items.aggregate(Sum('equip_pts'))
        slots_used = slot_info['equip_pts__sum']
        if slots_used > 2:
            raise ValidationError( 
                'Too Many Items. player using: %s slots, maximum allowed: %s'
                % (slots_used, 2)
            )
        for item in items:
            if item.min_st > st:
                raise ValidationError( 
                    "Insufficient str for that weapon. player: %s, required: %s"
                    % (st, item.min_st)
                )
        total_armour = items.all().exclude(adj_ma=0).count()
        if total_armour > 1:
            raise ValidationError(
                "Only one set of armour allowed. %s selected." % total_armour
            )
        return cleaned_data

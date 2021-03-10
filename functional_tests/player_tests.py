import unittest
from time import sleep

from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

from game.models import Item

class NewPlayerTest(StaticLiveServerTestCase):  
    def setUp(self):
        super().setUp()
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(4)
        self.browser.get('%s%s' % (self.live_server_url, ''))
        self.user = User.objects.create_user(username='joe', password='super_secret')
        self.short_sword = Item.objects.create(
            name='Short Sword',
            damage_dice=2,
            damage_mod=-1,
            equip_pts=1,
            min_st=11
        )
        self.long_sword = Item.objects.create(
            name='Two-Handed Sword',
            damage_dice=3,
            damage_mod=0,
            equip_pts=2,
            min_st=14,
        )
        self.leather_armor = Item.objects.create(
            name='Leather Armour',
            hit_takes=2,
            adj_ma=8,
            dx_adj=2
        )
        self.chain_armor = Item.objects.create(
            name='Chain Mail',
            hit_takes=2,
            adj_ma=6,
            dx_adj=3
        )

        # She is shown a login screen
        self.assertIn('Login', self.browser.title)  

        # She enters previously provided username and pw and is 
        # redirected to login page
        inputbox = self.browser.find_element_by_id('id_username')
        inputbox.send_keys('joe')
        inputbox.send_keys(Keys.TAB)

        inputbox = self.browser.find_element_by_id('id_password')
        inputbox.send_keys('super_secret')
        inputbox.send_keys(Keys.ENTER)
        sleep(2)


        # results in game lobby
        header_text = self.browser.find_element_by_tag_name('h1').text
        self.assertIn('WayLame: The Blantasy Blip!', header_text)

    def tearDown(self):  
        super().tearDown()

    def test_can_create_edit_delete_player(self):   
        # Edith has logged in and clicks new player link
        new_button = self.browser.find_element_by_name('create_figure')
        new_button.click()
        sleep(3)

        # Edith enters name, st, and dx.
        inputbox = self.browser.find_element_by_id('id_figure_name')
        inputbox.send_keys('Wulf')
        inputbox.send_keys(Keys.TAB)

        inputbox = self.browser.find_element_by_id('id_strength')
        inputbox.send_keys('12')
        inputbox.send_keys(Keys.TAB)

        inputbox = self.browser.find_element_by_id('id_dexterity')
        inputbox.send_keys('12')
        inputbox.send_keys(Keys.TAB)

        labels = ['Short Sword',]
        select = Select(self.browser.find_element_by_id('id_items'))
        for label in labels:
            select.select_by_visible_text(label)

        self.browser.find_element_by_xpath("//input[@type='submit' and @value='Submit']").click()
        sleep(3)
        
        # Edith is taken back to lobby with new user showing.
        header_text = self.browser.find_element_by_tag_name('h1').text
        self.assertIn('WayLame: The Blantasy Blip!', header_text)

        sleep(3)

        # Edith decides to change Wulf so clicks edit
        fignames = ['Wulf',]
        player_list = self.browser.find_element_by_id('playerList')
        player_links = player_list.find_elements_by_css_selector('.action')
        for link in player_links:
            if 'Wulf' in link.text:
                link.click()
                break
        
        sleep(3)

        # Edith selects lon sword but is rejected due to st
        select = Select(self.browser.find_element_by_id('id_items'))
        select.select_by_visible_text('Two-Handed Sword')
        select.deselect_by_visible_text('Short Sword')
        sleep(3)

        self.browser.find_element_by_xpath("//input[@type='submit' and @value='Submit']").click()
        sleep(3)

        # Edith changes the st and dx and re-selects the long sword
        inputbox = self.browser.find_element_by_id('id_strength')
        inputbox.clear()
        inputbox.send_keys('14')
        inputbox.send_keys(Keys.TAB)

        inputbox = self.browser.find_element_by_id('id_dexterity')
        inputbox.send_keys('10')
        #inputbox.send_keys(Keys.TAB)

        select = Select(self.browser.find_element_by_id('id_items'))
        select.select_by_visible_text('Two-Handed Sword')

        self.browser.find_element_by_xpath("//input[@type='submit' and @value='Submit']").click()
        sleep(3)

        # Edith starts a new game
        self.browser.find_element_by_name("create_game").click()
        sleep(3)
        
        # Edith decides she wants to delete the game
        game_list = self.browser.find_element_by_id('gameList')
        game_links = game_list.find_elements_by_css_selector('.action')
        for link in game_links:
            if 'Delete' in link.text:
                link.click()
                break
        sleep(3)


if __name__ == '__main__':  
    unittest.main()
import unittest
from time import sleep

from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase

from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class NewVisitorTest(StaticLiveServerTestCase):  

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            username='joe',
            password='super_secret'
        )
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(4)

    def tearDown(self):  
        self.browser.quit()

    def test_can_create_a_username_and_login(self):  
        # Edith has heard about a cool new online game. She goes
        # to check out its homepage
        self.browser.get('%s%s' % (self.live_server_url, ''))
        # sleep(2)

        # She is shown a login screen
        self.assertIn('Login', self.browser.title)  

        # She clicks registration link to create account
        inputbox = self.browser.find_element_by_id('id_username')

        # She enters previously provided username and pw and is 
        # redirected to login page
        inputbox.send_keys('joe')
        inputbox.send_keys(Keys.TAB)
        inputbox = self.browser.find_element_by_id('id_password')
        inputbox.send_keys('super_secret')
        inputbox.send_keys(Keys.ENTER)
        
        # results in game lobby
        header_text = self.browser.find_element_by_tag_name('h1').text
        self.assertIn('WayLame: The Blantasy Blip!', header_text)
        

if __name__ == '__main__':  
    unittest.main()

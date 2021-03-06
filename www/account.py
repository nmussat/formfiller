#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import os
import wsgiref.handlers
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

from model import *

class AccountHandler(webapp.RequestHandler):

	def get(self):
		user = users.get_current_user()

        bookmarklet = """javascript:(
            function() {
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.charset = 'utf-8';
                s.src = 'http://localhost:8081/static/js/formfiller.js';
                document.getElementsByTagName('head')[0].appendChild(s);
                return false;
            })();"""

		websites = Web.all().filter("user = ", user)

		template_values = {
			'user': user,
			'loginUrl': users.create_login_url('/'),
			'website': websites
		}

		path = os.path.join(os.path.dirname(__file__), 'templates/base_account_index.html')
		self.response.out.write(template.render(path, template_values))

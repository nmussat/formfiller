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

class FormsAPIHandler(webapp.RequestHandler):

	def get(self):
		user = users.get_current_user()

		# Check user authentication
		if user is None:
			url = users.create_login_url('/api/forms')
			self.redirect(self.request.path)
			return True
			
		# Prepare filters
		selfDomain = self.request.host
		referer = self.request.referer # TODO: Get referer host
		path = self.request.referer # TODO: Get referer path
		
		# Get all user's forms
		forms = Form.all().filter('user = ', user)
		
		# Apply all filters
		if (selfDomain != referer):
			forms.filter("host = ", referer)
		if (path != ''):
			forms.filter("path = ", path)
		
		result = {}
		for form in forms:
			f = result.append(form.name, {})
			for field in form.FormFields:
				f.append(field.name, field.value)
			
		self.response.out.write(result.toJSON())

	def put(self):
		pass
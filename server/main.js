import { Meteor } from 'meteor/meteor';

import '../imports/api/messages.js';

Meteor.startup(() => {
	console.log(`${new Date().toLocaleString()}: Server started`)
  // code to run on server at startup
});

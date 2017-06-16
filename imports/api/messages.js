import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Messages = new Mongo.Collection('messages');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('messages', function messagesPublication() {
    // Send nothing for unauthenticated user
    if (!this.userId) {
      return this.ready();
    }
    // Send all messages for authenticated user
    return Messages.find();
  });
}

Meteor.methods({
  'messages.insert'(text, username) {
    check(text, String);

    // Make sure the user is logged in before inserting a message
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    return Messages.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username
    });
  },
  'messages.remove'(messageId) {
    check(messageId, String);

    const message = Messages.findOne(messageId);

    if (message.owner !== this.userId) {
      // Make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    return Messages.remove(messageId);
  }
});

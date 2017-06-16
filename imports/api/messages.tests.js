/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';

import { Messages } from './messages.js';

if (Meteor.isServer) {
  describe('Messages', () => {
    const userId = Random.id();
    const username = 'testUser';
    const text = 'test message';

    let messageId;

    beforeEach(() => {
      Messages.remove({});
    });

    function insertMessage(userId) {
      // Find the internal implementation of the message methods so we can
      // test it in isolation
      const _insertMessage = Meteor.server.method_handlers['messages.insert'];
      // Set up a fake method invocation that looks like what the method expects
      const invocation = { userId, username };

      // Run the method with `this` set to the fake invocation
      return _insertMessage.apply(invocation, [text]);
    }

    function deleteMessage(userId) {
      const messageId = insertMessage(userId);
      const _deleteMessage = Meteor.server.method_handlers['messages.remove'];
      const invocation = { userId };

      return _deleteMessage.apply(invocation, [messageId]);
    }

    describe('methods', () => {
      describe('insert', () => {
        it('can create a new message', () => {
          insertMessage(userId);
          assert.equal(Messages.find().count(), 1);
        });

        it('fails for guest', () => {
          assert.throws(insertMessage, Meteor.Error, /not-authorized/);
        });
      });

      describe('remove', () => {
        it('can delete a message', () => {
          deleteMessage(userId);
          assert.equal(Messages.find().count(), 0);
        });

        it('fails for guest', () => {
          assert.throws(deleteMessage, Meteor.Error, /not-authorized/);
        });
      });
    });

    describe('publications', () => {
      // Pub/Sub is asynchronous
      // Using PublicationCollector to collect everything
      it('sends all messages', done => {
        insertMessage(userId);

        const collector = new PublicationCollector({ userId });
        collector.collect('messages', collections => {
          assert.equal(collections.messages.length, 1);
          done();
        });
      });

      it('is empty for guest', done => {
        insertMessage(userId);

        const collector = new PublicationCollector();
        collector.collect('messages', collections => {
          assert.isUndefined(collections.messages);
          done();
        });
      });
    });
  });
}

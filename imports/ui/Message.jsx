import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import { Messages } from '../api/messages.js';

// Message component - represents a single message item
export default class Message extends Component { 
  deleteThisMessage() {
    // Task b)Delete a message they own from the system, **ONLY** using a server side call
    // Here we use Meteor Method (RPC) to delete the message
    Meteor.call('messages.remove', this.props.message._id);
  }
  
  render() {
    const {
      message,
      showDeleteMessage,
    } = this.props
    // Give messages a different className when they are checked off,
    // so that we can style them nicely in CSS
    const messageClassName = message.checked ? 'checked' : '';

    return (
      <li className={messageClassName}>
        { showDeleteMessage &&
          <button className="delete" onClick={this.deleteThisMessage.bind(this)}>
            &times;
          </button>
        }
 
        <span className="text">
          <strong>{message.username}</strong>: {message.text}
        </span>
      </li>
    );
  }
}
 
Message.propTypes = {
  // This component gets the message to display through a React prop.
  // We can use propTypes to indicate it is required
  message: PropTypes.object.isRequired,
  showDeleteMessage: PropTypes.bool.isRequired,
};
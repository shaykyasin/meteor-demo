import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
 
import { Messages } from '../api/messages.js'; 
import Message from './Message.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
 
    this.state = {};
  }

  handleSubmit(event) {
    event.preventDefault();
 
    // Find the text field via the React ref
    const inputNode = ReactDOM.findDOMNode(this.refs.textInput)
    const text = inputNode.value.trim();
    const owner = Meteor.userId();

    if (!owner || !text) {
      return;
    }

    // Task a)Post a message to the system - without an explicit server side call
    // Message is posted directly from the client without any server validation
    Messages.insert({
      text,
      createdAt: new Date(),
      owner,
      username: Meteor.user().username,
    });
 
    // Clear form
    inputNode.value = '';
  }

  renderMessages() {
    let { messages } = this.props;
    
    return messages.map((message) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showDeleteMessage = currentUserId === message.owner 
 
      return (
        <Message
          key={message._id}
          message={message}
          showDeleteMessage={showDeleteMessage}
        />
      );
    });
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Messages</h1>
          
          <AccountsUIWrapper />
          
          { this.props.currentUser ?
            <div>
              <form className="new-message" onSubmit={this.handleSubmit.bind(this)} >
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Type to add new messages"
                />
              </form>
            </div>
            :
            <p>Please sign-in to post and view messages</p>
          }

        </header>
 
        <ul>
          {this.renderMessages()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('messages');
  
  return {
    messages: Messages.find({}, { sort: { createdAt: -1 } }).fetch(),
    currentUser: Meteor.user(),
  };
}, App);